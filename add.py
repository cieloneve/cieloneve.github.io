import requests

num=int(input())
res=[]
no=[]

for x in range(0,num):
    res.append(input("member res : "))
    no.append(input("no : "))

for x in range(0,num):
    image_url=f"https://assets.pjsek.ai/file/pjsekai-assets/startapp/character/member_cutout/res{res[x]}_no{no[x]}/after_training/deck_s.png"
    print(image_url)
    img_data = requests.get(image_url).content
    with open(f'./small/res{res[x]}/no{no[x]}.png', 'wb') as handler:
        handler.write(img_data)
    image_url=f"https://assets.pjsek.ai/file/pjsekai-assets/startapp/character/member_cutout/res{res[x]}_no{no[x]}/normal/deck_s.png"
    img_data = requests.get(image_url).content
    with open(f'./small/res{res[x]}/no{no[x]}_normal.png', 'wb') as handler:
        handler.write(img_data)
    