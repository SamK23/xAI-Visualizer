
const rawJson = {"columns":["Feature","Contribution","Impact"],"data":[["alcohol",1.5712558031,"Positive"],["sulphates",0.9624174833,"Positive"],["total sulfur dioxide",0.6518693566,"Negative"],["volatile acidity",0.5169388652,"Negative"],["chlorides",0.5033429861,"Positive"],["pH",0.371339947,"Negative"],["density",0.3486789465,"Negative"],["fixed acidity",0.337703079,"Negative"],["free sulfur dioxide",0.3049920797,"Negative"],["citric acid",0.2762276828,"Positive"],["residual sugar",0.2197407633,"Positive"]]};

function parseData(json) {
    if (
        typeof json === "object" &&
        json !== null &&
        Array.isArray(json.columns) &&
        Array.isArray(json.data) &&
        json.columns.includes("Feature") &&
        json.columns.includes("Contribution") &&
        json.columns.includes("Impact")
      ) {
        const featureIdx = json.columns.indexOf("Feature");
        const contributionIdx = json.columns.indexOf("Contribution");
        const impactIdx = json.columns.indexOf("Impact");

        const featuresArray = json.data.map(row => {
            const contribution = typeof row[contributionIdx] === "number" ? row[contributionIdx] : 0;
            return {
                name: row[featureIdx] || "Unknown Feature",
                importance: Math.abs(contribution),
                value: contribution,
                isPositive: row[impactIdx] === "Positive"
            };
        });
        
        return featuresArray;
      }
      return null;
}

const result = parseData(rawJson);
console.log(JSON.stringify(result, null, 2));
