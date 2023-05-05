import requests

dir_name="small/"

url_prefix="https://assets.pjsek.ai/file/pjsekai-assets/startapp/character/member_cutout/"
url_postfix="/deck_s.png"
url_infix=["/after_training","/normal"]
# url=url_prefix+"res022_no028"+url_postfix

# res=requests.get(url)




def writepng(name,res):
    with open(dir_name+name+".png","wb") as f:
        f.write(res.content)

if __name__ == '__main__':   
    for x in range(1,27):
        for y in range(1,34):
            charN="res"+str("%03d"%x)+"_no"+str("%03d"%y)
            dirN="res"+str("%03d"%x)+"/no"+str("%03d"%y)
            url=url_prefix+charN+url_infix[0]+url_postfix
            res=requests.get(url)
            if res.status_code==200:
                print("dl..."+charN)
                writepng(dirN,res)
                url=url_prefix+charN+url_infix[1]+url_postfix
                res=requests.get(url)
                writepng(dirN+"_normal",res)