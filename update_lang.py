import re

with open('lang.js', 'r', encoding='utf-8') as f:
    content = f.read()

uz_subs = """        subjOzbek: "O'zbek tili",
        subjSanat: "San'at",
        subjRus: "Rus tili",
        subjIngliz: "Ingliz tili",
        subjTabiiy: "Tabiiy fan",
        subjOzbTarix: "O'zbekiston tarixi",
        subjJahonTarix: "Jahon tarixi",
        subjQorTarix: "Qoraqalpog'iston tarixi",
        subjAdabiyot: "Adabiyot",
        subjGeografiya: "Geografiya",
        subjTexnologiya: "Texnologiya",
        subjAlgebra: "Algebra",
        subjGeometriya: "Geometriya","""

kaa_subs = """        subjOzbek: "Ózbek tili",
        subjSanat: "ART",
        subjRus: "Rus tili",
        subjIngliz: "Inglis tili",
        subjTabiiy: "Tábiiy pán",
        subjOzbTarix: "Ózbekstan tariyxi",
        subjJahonTarix: "Jahan tariyxi",
        subjQorTarix: "Qaraqalpaqstan tariyxi",
        subjAdabiyot: "Ádebiyat",
        subjGeografiya: "Geografiya",
        subjTexnologiya: "Texnologiya",
        subjAlgebra: "Algebra",
        subjGeometriya: "Geometriya","""

en_subs = """        subjOzbek: "Uzbek Language",
        subjSanat: "ART",
        subjRus: "Russian Language",
        subjIngliz: "English Language",
        subjTabiiy: "Natural Science",
        subjOzbTarix: "History of Uzbekistan",
        subjJahonTarix: "World History",
        subjQorTarix: "History of Karakalpakstan",
        subjAdabiyot: "Literature",
        subjGeografiya: "Geography",
        subjTexnologiya: "Technology",
        subjAlgebra: "Algebra",
        subjGeometriya: "Geometry","""

pattern = re.compile(r'subjOnaTili:\s*".*?",\s*subjMatematika:\s*".*?",\s*subjFizika:\s*".*?",\s*subjKimyo:\s*".*?",\s*subjBiologiya:\s*".*?",\s*subjTarix:\s*".*?",\s*subjHuquq:\s*".*?",\s*subjInformatika:\s*".*?",?')

# The pattern appears 3 times: uz, kaa, en
matches = pattern.findall(content)
if len(matches) == 3:
    content = content.replace(matches[0], uz_subs)
    content = content.replace(matches[1], kaa_subs)
    content = content.replace(matches[2], en_subs)
    
    with open('lang.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated lang.js")
else:
    print(f"Error: found {len(matches)} matches instead of 3")
