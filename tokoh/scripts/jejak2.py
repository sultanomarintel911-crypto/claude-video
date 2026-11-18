import cv2, numpy as np, json, sys
src, out, seed_i, sx, sy, sw, sh = sys.argv[1], sys.argv[2], int(sys.argv[3]), *map(int, sys.argv[4:8])
cap=cv2.VideoCapture(src); fr=[]
while True:
    ok,f=cap.read()
    if not ok: break
    fr.append(cv2.cvtColor(f,cv2.COLOR_BGR2GRAY))
N=len(fr); box=[None]*N; box[seed_i]=(sx,sy,sw,sh,1.0)
def step(i,j):
    x,y,w,h,sc=box[i]
    T=fr[i][int(y):int(y+h),int(x):int(x+w)]
    best=(-1,None)
    for s in (0.94,0.97,1.0,1.03,1.06):
        t=cv2.resize(T,None,fx=s,fy=s); th,tw=t.shape
        x0,y0=int(x+w/2-tw/2-40),int(y+h/2-th/2-40)
        x0,y0=max(0,x0),max(0,y0)
        win=fr[j][y0:y0+th+80,x0:x0+tw+80]
        if win.shape[0]<th or win.shape[1]<tw: continue
        r=cv2.matchTemplate(win,t,cv2.TM_CCOEFF_NORMED); _,mv,_,ml=cv2.minMaxLoc(r)
        if mv>best[0]: best=(mv,(x0+ml[0],y0+ml[1],tw,th,sc*s))
    box[j]=best[1]; return best[0]
sc=[0]*N
for i in range(seed_i,N-1): sc[i+1]=step(i,i+1)
for i in range(seed_i,0,-1): sc[i-1]=step(i,i-1)
json.dump([list(map(float,b))+[float(s)] for b,s in zip(box,sc)],open(out,'w'))
print(min(sc[1:]), np.percentile(sc,10))
