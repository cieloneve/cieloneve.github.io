group=['na',"ln","mmj","vbs","ws","25"]
lim=["no","yes"]
attr=["david","moon","green","heart","star"]


import json


lim_list={}

with open("fake.json","w") as f:
    for x in range(1,27):
        path="./data/res"+str("%03d"%x)+".json"
        with open(path,'r') as data:
            temp_list=[]
            count=0
            dic=json.load(data)
            for k in dic.keys():
                if(dic[k]["fake"]=="yes"):
                    temp_list.append(k)
        lim_list["res"+str("%03d"%x)]=temp_list
    json.dump(lim_list,f)  