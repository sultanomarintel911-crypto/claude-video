# Jana potret pentadbir yang seragam (latar dibuang, diselaraskan ikut mata, latar studio sama).
# Guna: python3 scripts/potret_seragam.py <folder lembaran watak> <folder kad PK Ko>
# Perlu: rembg, opencv-python-headless 4.10, model YuNet di /root/.cache/yunet/yunet.onnx
import sys,cv2,numpy as np
from PIL import Image,ImageFilter
from rembg import remove,new_session
I,S=sys.argv[1],sys.argv[2]
sess=new_session('u2net_human_seg')
det=cv2.FaceDetectorYN.create('/root/.cache/yunet/yunet.onnx','',(320,320),0.6)
src={
 'gb':(Image.open(I+'/6.webp'),(30,120,330,600)),
 'pkp':(Image.open(I+'/8.webp'),(120,30,390,520)),
 'hem':(Image.open(I+'/9.webp'),(35,120,335,600)),
 'ko':(Image.open(S+'/ko_kad.png'),(250,150,830,880)),
 'ppki':(Image.open(I+'/11.webp'),(20,85,320,590)),
}
CW,CH=800,1000;IOD=118;ECX,ECY=400,330
yy,xx=np.mgrid[0:CH,0:CW]
d=np.sqrt(((xx-CW/2)/CW)**2+((yy-CH*0.35)/CH)**2)
c1=np.array([38,72,110]);c0=np.array([6,14,28])
t=np.clip(d/0.75,0,1)[...,None];bg=c1*(1-t)+c0*t
bgim=Image.fromarray(bg.astype('uint8'))
for k,(img,box) in src.items():
    im=img.convert('RGB').crop(box)
    if im.width<700: im=im.resize((im.width*3,im.height*3),Image.LANCZOS)
    bgr=cv2.cvtColor(np.array(im),cv2.COLOR_RGB2BGR)
    det.setInputSize((bgr.shape[1],bgr.shape[0]))
    _,faces=det.detect(bgr)
    fc=max(faces,key=lambda r:r[2])
    rex,rey,lex,ley=fc[4],fc[5],fc[6],fc[7]
    iod=np.hypot(lex-rex,ley-rey);w=iod
    emx,emy=(rex+lex)/2,(rey+ley)/2
    cut=remove(im,session=sess)
    al=np.array(cut.split()[3]).astype(float)
    H_,W_=al.shape
    ry=np.clip((H_-1-np.arange(H_))/(0.12*H_),0,1)[:,None]
    rx=np.clip(np.minimum(np.arange(W_),W_-1-np.arange(W_))/(0.06*W_),0,1)[None,:]
    rgb=np.array(cut.convert('RGB')).astype(int)
    cyan=(rgb[...,2]>140)&(rgb[...,1]>140)&(rgb[...,0]<120)
    cyan=cv2.dilate(cyan.astype(np.uint8),np.ones((9,9),np.uint8))>0
    al=al*(~cyan)
    cut.putalpha(Image.fromarray((al*ry*rx).astype('uint8')))
    s=IOD/iod
    cut=cut.resize((int(cut.width*s),int(cut.height*s)),Image.LANCZOS)
    fx,fy=emx*s,emy*s
    canvas=bgim.copy().convert('RGBA')
    a=cut.split()[3].filter(ImageFilter.GaussianBlur(25))
    glow=Image.new('RGBA',cut.size,(98,230,255,0));glow.putalpha(a.point(lambda v:int(v*0.35)))
    pos=(int(ECX-fx),int(ECY-fy))
    canvas.alpha_composite(glow,pos);canvas.alpha_composite(cut,pos)
    arr=np.array(canvas.convert('RGB')).astype(float)
    fade=np.clip((np.arange(CH)-700)/240,0,1)[:,None,None]**1.3
    arr=arr*(1-fade)+bg*fade
    Image.fromarray(arr.astype('uint8')).save(f'public/montaj/wajah_{k}.jpg',quality=92)
    print(k,'muka',w,'skala',round(s,2),'pos',pos)
ims=[Image.open(f'public/montaj/wajah_{k}.jpg').resize((320,400)) for k in src]
c=Image.new('RGB',(1600,400))
for i,im in enumerate(ims):c.paste(im,(i*320,0))
c.save(S+'/seragam.jpg')
