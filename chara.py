import json
import add
path='./data/res'

def readChara(res)->dict:
    s='{:0>3d}'.format(res)
    path_char=path+s+'.json'
    
    with open(path_char,"r") as f:
        data=json.load(fp=f)
    return data
def writeChara(res,sw : str):
    s='{:0>3d}'.format(res)
    path_char=path+s+'.json'

    with open(path_char,"w") as f:
        f.write(sw)
    
def formatjson(data) -> str:
    json_str=''
    json_str=json_str+'{\n'
    for key in data.keys():        
        json_str+=f'\"{key}\" : {json.dumps(data[key])},\n'
    json_str=json_str[:-2]
    json_str+='\n}'

    return json_str

def addCard():
    event=input("W or N or L or F: ")
    template= {"group": "ws", "lim": "no", "fes": "no", "fake": "no", "attr": "heart"}
    
    if event!="W":
        cardNum = int(input("CardNum : "))
        attr = input("star heart moon david green : ")
        template["attr"]=attr
        res_s=[]
        no_s=[]
        if event=='L':
            template["lim"]='yes'
        
        for i in range(cardNum):
            res = input("res : ")
            no = input("no : ")
            if int(res)<=20 :
                template["group"]=(int(res)-1)//4+1
            
            else:
                template["group"]=input("ln mmj vbs ws 25")
            
            d=readChara(int(res))
            d['no'+no]=template
            writeChara(int(res),formatjson(d))
            
            res_s.append(res)
            no_s.append(no)
        add.addPics(cardNum,res_s,no_s)

addCard()