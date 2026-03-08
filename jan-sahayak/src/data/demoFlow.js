export const RAMU_DEMO = {
  scenario: "ramu",
  answers: { 
    state: "UP", 
    occupation: "farmer", 
    income: "below1L", 
    land: "2hectare", 
    age: 52, 
    familySize: 4 
  },
  expectedSchemes: ["PM-KISAN", "PMFBY", "KCC", "AYUSHMAN", "PMAY"],
  mockExtractedData: { 
    name: "राम कुमार", 
    dob: "15/08/1972", 
    aadhaar: "XXXX-1234", 
    ifsc: "SBI0001234" 
  }
};
