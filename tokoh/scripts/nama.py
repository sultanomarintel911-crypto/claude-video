import cv2, numpy as np, json, sys, glob
from PIL import Image, ImageDraw, ImageFont
S='/tmp/claude-0/-home-user-claude-video/351bcb4b-60df-59f0-92b0-4f1dcdf9eec4/scratchpad'
SRC='public/v8/flow/to_the_basement.mp4'; OUT=sys.argv[1] if len(sys.argv)>1 else f'{S}/klip/tb_baru.mp4'
B=json.load(open(f'{S}/jejak2.json'))
cap=cv2.VideoCapture(SRC); fr=[]
while True:
    ok,f=cap.read()
    if not ok: break
    fr.append(f)
N=len(fr); R=150
ox,oy=1236,701; PW,PH=116,72  # tampalan rujukan (tag + jidar)
ref=fr[R][oy:oy+PH,ox:ox+PW].copy()
quad=(np.float32([[1277.3,721],[1339.8,723.5],[1337.3,753.5],[1274.1,751]])-np.float32([ox,oy])).astype(np.float32)
# panel bersih + RUSMADI (dilukis resolusi tinggi dalam segi empat tepat, kemudian diunjur ke quad)
RW,RH=640,300
g=cv2.cvtColor(ref,cv2.COLOR_BGR2GRAY)
Hq=cv2.getPerspectiveTransform(quad,np.float32([[0,0],[RW,0],[RW,RH],[0,RH]]))
rect=cv2.warpPerspective(ref,Hq,(RW,RH),flags=cv2.INTER_CUBIC)
# warna panel: median piksel gelap
dark=rect[cv2.cvtColor(rect,cv2.COLOR_BGR2GRAY)<np.percentile(cv2.cvtColor(rect,cv2.COLOR_BGR2GRAY),25)]
col=np.median(dark,0)
# kecerunan menegak lembut seperti asal
top=np.median(rect[:40].reshape(-1,3),0); bot=np.median(rect[-40:].reshape(-1,3),0)
yy=np.linspace(0,1,RH)[:,None,None]
clean=0.8*(col*0.8+ (top*(1-yy)+bot*yy)*0.2).astype(np.float32)*np.ones((RH,RW,3),np.float32)
clean=np.clip(clean,0,255).astype(np.uint8)
im=Image.fromarray(cv2.cvtColor(clean,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im)
fp=([p for p in glob.glob('/usr/share/fonts/**/*Bold*.ttf',recursive=True) if 'Sans' in p and 'Mono' not in p] or glob.glob('/usr/share/fonts/**/*Bold*.ttf',recursive=True))[0]
txt='RUSMADI'; fs=200
while True:
    f=ImageFont.truetype(fp,fs); bb=d.textbbox((0,0),txt,font=f)
    if bb[2]-bb[0]<RW*0.86 and bb[3]-bb[1]<RH*0.62: break
    fs-=4
x0=(RW-(bb[2]-bb[0]))//2-bb[0]; y0=(RH-(bb[3]-bb[1]))//2-bb[1]
d.text((x0+4,y0+6),txt,font=f,fill=(10,20,22))
d.text((x0,y0),txt,font=f,fill=(236,244,246))
rect2=cv2.cvtColor(np.asarray(im),cv2.COLOR_RGB2BGR)
rect2=cv2.GaussianBlur(rect2,(0,0),1.2)
# kembali ke koordinat tampalan rujukan
Hi=np.linalg.inv(Hq)
pan=cv2.warpPerspective(rect2,Hi,(PW,PH),flags=cv2.INTER_AREA)
m=np.zeros((PH,PW),np.float32); cv2.fillConvexPoly(m,quad.astype(np.int32),1.0)
m=cv2.erode(m,np.ones((2,2),np.uint8)); m=cv2.GaussianBlur(m,(0,0),0.7)
# ECC berantai dari R
gr=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY).astype(np.float32) for f in fr]
T=gr[R][oy:oy+PH,ox:ox+PW]
W=[None]*N; W[R]=np.array([[1,0,ox],[0,1,oy],[0,0,1]],np.float32); cc=[1.0]*N
crit=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,80,1e-5)
def go(i,j):
    w=W[i].copy()
    # anjakan awal dari penjejak
    bi,bj=B[i],B[j]
    w[0,2]+= (bj[0]+bj[2]/2)-(bi[0]+bi[2]/2); w[1,2]+=(bj[1]+bj[3]/2)-(bi[1]+bi[3]/2)
    try:
        c,w2=cv2.findTransformECC(T,gr[j],w,cv2.MOTION_HOMOGRAPHY,crit,None,3)
        W[j]=w2; cc[j]=c
    except cv2.error:
        W[j]=w; cc[j]=0
for i in range(R,N-1): go(i,i+1)
for i in range(R,0,-1): go(i,i-1)
print('ECC min %.3f p10 %.3f'%(min(cc),np.percentile(cc,10)))
json.dump([w.tolist() for w in W],open(f'{S}/klip/H.json','w'))
# lukis: isi panel = kabur berwajaran piksel bukan-teks asal (kekal silau/cahaya), kemudian teks RUSMADI sebagai alfa
ta_im=Image.new('L',(RW,RH),0); ImageDraw.Draw(ta_im).text((x0,y0),txt,font=f,fill=255)
ta=cv2.GaussianBlur(np.asarray(ta_im).astype(np.float32)/255,(0,0),1.0)
ta_ref=cv2.warpPerspective(ta,Hi,(PW,PH),flags=cv2.INTER_AREA)
vw=cv2.VideoWriter(f'{S}/klip/_tmp.mp4',cv2.VideoWriter_fourcc(*'mp4v'),30,(1920,1080))
for j in range(N):
    f=fr[j].copy().astype(np.float32)
    Hw=W[j]
    mm=cv2.warpPerspective(m,Hw,(1920,1080),flags=cv2.INTER_LINEAR)
    a_=cv2.warpPerspective(ta_ref,Hw,(1920,1080),flags=cv2.INTER_LINEAR)
    ys,xs=np.nonzero(mm>0.02)
    if len(xs)<10:
        vw.write(fr[j]); continue
    x0_,x1_,y0_,y1_=max(0,xs.min()-20),min(1920,xs.max()+20),max(0,ys.min()-20),min(1080,ys.max()+20)
    F_=f[y0_:y1_,x0_:x1_]; M_=mm[y0_:y1_,x0_:x1_]; A_=a_[y0_:y1_,x0_:x1_]
    lum=cv2.cvtColor(F_.astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32)
    inside=lum[M_>0.5]
    thr=np.percentile(inside,55) if inside.size else 255
    wgt=((M_>0.3)&(lum<=thr)).astype(np.float32)
    sig=max(2.0,(y1_-y0_)/10)
    num=cv2.GaussianBlur(F_*wgt[...,None],(0,0),sig); den=cv2.GaussianBlur(wgt,(0,0),sig)[...,None]
    fill=num/np.maximum(den,1e-3)
    pan=F_*(1-M_[...,None])+fill*M_[...,None]
    tc=np.clip(fill+110,0,248)  # teks lebih cerah daripada panel, seperti asal
    out=pan*(1-A_[...,None])+tc*A_[...,None]
    f[y0_:y1_,x0_:x1_]=out
    vw.write(np.clip(f,0,255).astype(np.uint8))
vw.release()
import subprocess
subprocess.run(['ffmpeg','-y','-v','error','-i',f'{S}/klip/_tmp.mp4','-c:v','libx264','-crf','17','-pix_fmt','yuv420p',OUT],check=True)
print('siap',OUT)
