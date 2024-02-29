import json


with open('keywords_mondovo.json') as f:
   data = json.load(f)

another_form = {}

for key,val in data.items():
    for item in val:
        another_form[item.lower()] = key.lower()
print(another_form)

with open('keywords_mondovo2.json', 'w+') as fp:
    json.dump(another_form, fp,  indent=4)