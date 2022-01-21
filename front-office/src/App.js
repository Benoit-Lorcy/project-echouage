import MyForm from "./MyForm.js";
import MyGraph from "./MyGraph";
import "./App.css";

import React, { useState, useEffect } from "react";

function App() {
    const [graph, setGraph] = useState(false);
    const [graphData, setGraphData] = useState([]);

    const fetchEchouage = async (form) => {
        //console.log(form);
        //requette echouage
        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/v1/echouages?${form.start === 0 ? "" : "start=" + form.start + "&"
            }${form.end === 0 ? "" : "end=" + form.end + "&"}${"espece=" + form.id
            }`
        );

        //formatage de la response
        const formatedData = formatEchouage(await response.json());

        //si le
        if (formatedData.data[0]) {
            setGraphData(formatedData);
            setGraph(true);
        } else {
            alert("un problème est survenu");
            return;
        }
    };

    //cette fonctionner n'est pas très optimisée mais elle est lisible ;)
    const formatEchouage = (echouages) => {
        //converti le json en liste d'objects {date:"",zone:"",nombre""}
        echouages = echouages.map((echouage) => ({
            date: echouage.date,
            zone: echouage.zone.zone,
            nombre: echouage.nombre,
        }));

        //on récupère la liste de dates
        const dates = [];
        for (let i of echouages)
            if (!dates.includes(i.date)) dates.push(i.date);

        //on récupère la liste de zones
        const zones = [];
        for (let i of echouages)
            if (!zones.includes(i.zone)) zones.push(i.zone);

        //permet "d'additionner" l'attribu nombre des objects ayant la même date et la même zone
        let sumedData = [],
            flag = 0;
        for (let i in echouages) {
            for (let j in sumedData) {
                if (
                    echouages[i].date === sumedData[j].date &&
                    echouages[i].zone === sumedData[j].zone
                ) {
                    flag = 1;
                    sumedData[j].nombre += echouages[i].nombre;
                }
            }
            if (flag) flag = 0;
            else sumedData.push(echouages[i]);
        }

        //on récupère le max de nombre
        let max = 0;
        for (let i of echouages) if (i.nombre > max) max = i.nombre;

        // permet de trier les objects selon leur date
        // ce formatage permet de simplifier l'implémentation du graph
        // preparation du formatage :
        sumedData = sumedData.map((s) => ({
            date: s.date,
            valeurs: [{ zone: s.zone, nombre: s.nombre }],
        }));

        //tri par date
        const formatedData = [];
        flag = 0;
        for (let i in sumedData) {
            for (let j in formatedData) {
                if (sumedData[i].date === formatedData[j].date) {
                    flag = 1;
                    formatedData[j].valeurs.push(sumedData[i].valeurs[0]);
                }
            }
            if (flag) flag = 0;
            else formatedData.push(sumedData[i]);
        }

        console.log({
            dates: dates,
            zones: zones,
            max: max,
            data: formatedData,
        });
        return { dates: dates, zones: zones, max: max, data: formatedData };
    };


    return (
        <div>
            <MyForm onFormSubmit={fetchEchouage} />
            {graph && <MyGraph data={graphData} />}
        </div>
    );
}

export default App;
