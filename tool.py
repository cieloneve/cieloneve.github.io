import json
import requests

def addPics(num,res,no):
    for x in range(0,num):
        addPic(res[x],no[x])

def addPic(res,no):
    
    image_url=f"https://storage.sekai.best/sekai-jp-assets/thumbnail/chara_rip/res{res}_no{no}_after_training.png"   
    print(image_url)
    img_data = requests.get(image_url).content
    with open(f'./small/res{res}/no{no}.png', 'wb') as handler:
        handler.write(img_data)
    
    image_url=f"https://storage.sekai.best/sekai-jp-assets/thumbnail/chara_rip/res{res}_no{no}_normal.png"
    img_data = requests.get(image_url).content
    with open(f'./small/res{res}/no{no}_normal.png', 'wb') as handler:
        handler.write(img_data)

def formatjson(data) -> str:
    json_str=''
    json_str=json_str+'{\n'
    for key in data.keys():        
        json_str+=f'\"{key}\" : {json.dumps(data[key])},\n'
    json_str=json_str[:-2]
    json_str+='\n}'

    return json_str

def get_data(query):
    with open(f"./data/{query}.json",'r') as f: 
        data=json.load(fp=f)
    
    return data

def add_data(query,res,no):
    data = get_data(query)
    data["res{:0>3d}".format(int(res))].append("no{:0>3d}".format(int(no)))

    writeBuffer = formatjson(data)
    with open(f"./data/{query}.json","w") as f:
        f.write(writeBuffer)
        
if __name__=="__main__":
    print(get_data(""))