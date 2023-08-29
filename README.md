# franchise_import_script
This tool imports data from an Excel sheet and converts it into a provided format. Below is a few use case this caters to:
1. Import all the bets structure
2. Import all the reel structures.
3. Import rules(paytable) structure for ways and Line game.
4. Import Line structure for regular height and single reel height game.
5. Import jackpot structure.
6. Import any table that can have structures like ["ident" => 1, "multiplier"=>1, "weight"=>1]. 

**Steps to run tool**:
1. Clone the repo.
2. To install the packages, run the command "npm install"
3. To run the tool, run the command "npm start"
4. This tool will require a few inputs. Please follow the below instructions to configure the source/userInputConfig.json file.
    1. "fileName": This will contain the file name of the Excel sheet you need to import data from.
      
        **"fileName": "C:/Users/sg102852/Downloads/workspace/fast bingo meta/EngineerInput_FastBingoMeta_v4 - Copy.xlsx",**  
    2. "sheetNames": This will contain the feature-wise sheet name 

     **"sheetNames": {
        "reels": "Engineer 1",
        "bets": "Bet Structure",
        "rules": "Engineer 2",
        "lines": "Engineer 2",
        "jackpots": "Engineer 4",
        "anyTable": "Engineer 4"
    },**
   3. "symbolIdentMap": This will have the relation data of symbol - ident id.

   **"symbolIdentMap": {
        "PIC1": 1,
        "PIC2": 2,
        "PIC3": 3,
        "PIC4": 4,
        "PIC5": 5,
        "A": 6,
        "K": 7,
        "Q": 8,
        "J": 9,
        "10": 10,
        "WILD": 11,
        "SCAT": 15,
        "SCAT2": 15,
        "SCAT3": 16
    },**
  4. "autoFindKeys": auto-find keys will search the data based on keys given on the object below and will return the below info:
      1. Number of structures in sheet
      2. Starting cell ID and ending cell ID of each structure.
      3. If it is reel data, the height of each reel. 

  **  **"autoFindKeys": {
        "bet": "Scalable Bet Multiplier",
        "reel": "ReelData",
        "rules": "RulesData",
        "lines": "LineData",
        "jackpot": "JackpotData"
    },**
  ![image](https://github.com/ShubhamGupta-BigFish/franchise_import_script/assets/133100535/4a3a4964-1bf0-4d3f-a06d-f1e6d7557e25)
  ![image](https://github.com/ShubhamGupta-BigFish/franchise_import_script/assets/133100535/d401f936-aa57-4eb8-998d-ffb40fd9f1bb)
  ![image](https://github.com/ShubhamGupta-BigFish/franchise_import_script/assets/133100535/5f1ffc7a-552c-4251-90a7-cfe141d67311)
  ![image](https://github.com/ShubhamGupta-BigFish/franchise_import_script/assets/133100535/ee626b48-8e02-4e72-af8f-22e973eadd99)

  5. This is specific for if you need to import a table and you need to rename keys or add more keys. 

  **"importAnyTableCol": {
        "column0": "ident",
        "column1": "multiplier",
        "column2": "weights"
    }** 
