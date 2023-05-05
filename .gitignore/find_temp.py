import cv2


x=160
y=330
width=2800
heigth=1752
w=225
h=120
gap=50
small=224
set1=[]
big=cv2.imread('big.jpg')
crop_img=big[y:heigth-h,x:width-w]

for j in range(0,1):
    for i in range(0,2):
        set1.append(crop_img[j*gap+j*small:j*gap+j*small+small,i*gap+i*small:i*gap+i*small+small])

        print(i*gap+i*small,end=" , ")
        print(j*gap+j*small)
        
        cv2.imshow("asd",set1[j*9+i][20:150,35:220])
        cv2.waitKey()

        if i*gap+i*small+small > width-w-x:
            break
    if j*gap+j*small+small > heigth-h-y:
            break
from findimage import find_all_template,find_template

image_origin = cv2.imread('small/res018/no020.png')
match_result = find_template(image_origin, set1[1][20:150,35:220],auto_scale=(0.8,0.8),threshold=0.5,debug=True)

img_result = image_origin.copy()
rect = match_result['rectangle']
cv2.rectangle(img_result, (rect[0][0], rect[0][1]), (rect[3][0], rect[3][1]), (0, 0, 220), 2)
cv2.imwrite('result.png', img_result)