import json
import tool
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

def addCard():
    event=input("N or L or B : ")
    cardNum = int(input("CardNum : "))

    template= {"group": "ws", "lim": "no", "fes": "no", "fake": "no", "attr": "heart"}
    res_s=[]
    no_s=[]
    
    if event!="B":    
        attr = input("star heart moon david green : ")
        template["attr"]=attr

        if event=='L':
            template["lim"]='yes'
        
        for _ in range(cardNum):
            res = input("res : ")
            no = input("no : ")
            if int(res)<=20 :
                template["group"]=(int(res)-1)//4+1
            
            else:
                template["group"]=input("ln mmj vbs ws 25 na : ")
            
            d=readChara(int(res))
            d['no'+no]=template
            writeChara(int(res),tool.formatjson(d))
            
            tool.add_data("a",res,no)
            if event=='L':
                tool.add_data("lim",res,no)

            res_s.append(res)
            no_s.append(no)

    elif event=='B':
        for _ in range(cardNum):
            attr = input("star heart moon david green : ")       
            res = input("res : ")
            no = input("no : ")

            if int(res)<=20 :
                template["group"]=(int(res)-1)//4+1
            
            else:
                template["group"]=input("ln mmj vbs ws 25 na : ")
            template["attr"]=attr
            template["lim"]='yes'
            template["fes"]='yes'
            
            d=readChara(int(res))
            d['no'+no]=template
            writeChara(int(res),tool.formatjson(d))
            
            tool.add_data("a",res,no)
            tool.add_data("lim",res,no)
            tool.add_data("bf",res,no)

            res_s.append(res)
            no_s.append(no)
    else :
        print("Error")
    tool.addPics(cardNum,res_s,no_s)
    

addCard()