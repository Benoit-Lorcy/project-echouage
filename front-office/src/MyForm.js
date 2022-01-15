import React, { useState, useEffect } from 'react';
function MyForm() {
    const [form, setForm] = useState({ espece: "", start: 0, end: 0, id: -1 });
    const [autocomplete, setAutocomplete] = useState(false);
    const [autocompleteList, setAutocompleteList] = useState([]);
    const [cursor, setCursor] = useState(0);
    const [submited, setSubmited] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleAutocomplete = (e) => {
        const fetchEspece = async (espece) => {
            //https://localhost:8000/api/v1/especes?search=ball
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/especes?search=${espece}`);
            const especes = await response.json();
            await setAutocompleteList(especes);
        }

        setForm({ ...form, [e.target.name]: e.target.value });
        setCursor(0);

        if (autocompleteList[cursor] && form.espece === autocompleteList[cursor].espece) {
            setAutocomplete(false);
        } else if (e.target.value.length >= 3) {
            fetchEspece(e.target.value);
            setAutocomplete(true);
        } else {
            setAutocomplete(false);
            setAutocompleteList([]);
        }
    }

    const onKeyDown = (e) => {
        if (e.keyCode === 40) {
            setCursor((cursor + 1) % autocompleteList.length);
        } else if (e.keyCode === 38) {
            setCursor(cursor === 0 ? cursor : cursor - 1);
        } else if (e.keyCode === 13) {
            e.preventDefault();
            setForm({ ...form, espece: autocompleteList[cursor].espece, id: autocompleteList[cursor].id });
            setAutocomplete(false);
        }
    }

    const handleSubmitButton = () => {
        if (autocompleteList[0]) {
            setForm({ ...form, espece: autocompleteList[0].espece, id: autocompleteList[0].id });
            setAutocomplete(false);
        } else {
            alert("aucun resultat")
        }
    }

    const handleSearch = (e) => {
        setForm({ ...form, espece: e.target.dataset.name, id: Number(e.target.dataset.id) });
        setAutocomplete(false);
    }

    const onSubmit = (e) => { e.preventDefault(); };

    /*const highlight = (name) => {
        if (!name) return <span></span>;
        let match = RegExp('(.*)(' + form.espece + ')(.*)', 'gi').exec(name);
        return <span>{match[1]}<span style={{ fontWeight: "bold" }}>{match[2]}</span>{match[3]}</span >;
    }*/

    return (
        <form className="search" autoComplete="off" onSubmit={onSubmit}>
            <div className="inputgroup">
                <label htmlFor="start">Année début</label>
                <input className="field date" name="start" type="number" min="1900" max="2099" placeholder='1984' onChange={handleChange} />
            </div>
            <div className="inputgroup">
                <label htmlFor="end">Année fin</label>
                <input className="field date" name="end" type="number" min="1900" max="2099" placeholder='2020' onChange={handleChange} />
            </div>
            <div className="inputgroup especegroup">
                <label htmlFor="espece">Espèce</label>
                <input onKeyDown={onKeyDown} className="field espece" name="espece" type="text" placeholder='crabs' onChange={handleAutocomplete} value={form.espece} />
                {autocomplete && <div className='autocomplete' >
                    <div className='autocompleteItems' >
                        {autocompleteList.length > 0 ?
                            autocompleteList.map((elem, i) => (
                                <div key={elem.id} className={cursor === i ? "autocompleteItem active" : "autocompleteItem"} onClick={handleSearch} data-name={elem.espece} data-id={elem.id}>{elem.espece}</div>
                            ))
                            :
                            <div className='autocompleteItem'>No result</div>
                        }
                    </div>
                </div>}
            </div>
            <button className="field submit" onClick={handleSubmitButton}><i className="fas fa-search" style={{ color: "#fff" }}></i></button>
        </form>
    );
}

export default MyForm;