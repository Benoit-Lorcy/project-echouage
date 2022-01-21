import React, { useState, useEffect, useRef } from "react";
import * as d3 from "https://cdn.skypack.dev/d3@7";
import "./App.css";

function MyForm(props) {
    const [form, setForm] = useState({ espece: "", start: 0, end: 0, id: -1 });
    const [autocomplete, setAutocomplete] = useState(false);
    const [autocompleteList, setAutocompleteList] = useState([]);
    const [cursor, setCursor] = useState(0);
    const [submit, setSubmit] = useState(false);
    const formRef = useRef();

    //mais ça veu dire qu'on attend qu'un autre state s'update pour envoyer la requette c'est un peu moche
    //faudrai pas plus utiliser le meme state pour le submit?
    //hummm
    useEffect(() => {
        if (submit) {
            setSubmit(false);
            handleSubmit();
        }
    }, [submit, form])

    //handle change of the numbers inputs
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    //handle change on the text input
    const handleAutocomplete = (e) => {
        const fetchEspece = async (espece) => {
            //https://localhost:8000/api/v1/especes?search=ball
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/v1/especes?search=${espece}`
            );
            const especes = await response.json();
            await setAutocompleteList(especes);
        };

        setForm({ ...form, [e.target.name]: e.target.value });
        setCursor(0);

        if (
            autocompleteList[cursor] &&
            e.target.value === autocompleteList[cursor].espece
        ) {
            setAutocomplete(false);
        } else if (e.target.value.length >= 3) {
            fetchEspece(e.target.value);
            setAutocomplete(true);
        } else {
            setAutocomplete(false);
            setAutocompleteList([]);
        }
    };

    //handle search bar navigation
    const onKeyDown = (e) => {
        if (e.keyCode === 40) {
            setCursor((cursor + 1) % autocompleteList.length);
        } else if (e.keyCode === 38) {
            setCursor(cursor === 0 ? cursor : cursor - 1);
        } else if (e.keyCode === 13) {
            //obligé de faire ça parceque l'action par default d'entré est form submit
            if (autocomplete) {
                setForm({
                    ...form,
                    espece: autocompleteList[cursor].espece,
                    id: autocompleteList[cursor].id,
                });
            }
            setAutocomplete(false);
        }
    };

    //handle submit  if button is cliked (first suggestion is taken)
    const handleSubmitButton = () => {
        if (!autocomplete) {
            //send
        } else if (autocompleteList[0]) {
            setForm({
                ...form,
                espece: autocompleteList[0].espece,
                id: autocompleteList[0].id,
            });
            setAutocomplete(false);
        } else {
            alert("aucun resultat");
        }
    };

    // when user click on a autocomplete suggestion
    const handleSearch = (e) => {
        setForm({
            ...form,
            espece: e.target.dataset.name,
            id: Number(e.target.dataset.id),
        });
        setAutocomplete(false);
        console.log("should submit");
        setSubmit(true);
    };

    // handle the form submit and call the prop to pass the form object
    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (form.espece === "" || form.id === "-1") {
            alert("aucun resultat");
        } else {
            doAFlip();
            props.onFormSubmit(form);
        }
    };

    //logo research DO A FLIP
    const doAFlip = (e) => {
        d3.selectAll(".fa")
            .transition()
            .duration(5000)
            .style("transform", rotTween);
        function rotTween() {
            var i = d3.interpolate(0, 360);
            return function (t) {
                return "rotate(" + i(t) + ")";
            };
        }
    }

    return (
        <form ref={formRef} className="search" autoComplete="off" onSubmit={handleSubmit}>
            <div className="inputgroup">
                <label htmlFor="start">Année début</label>
                <input
                    className="field date"
                    name="start"
                    type="number"
                    min="1900"
                    max="2099"
                    placeholder="1984"
                    onChange={handleChange}
                />
            </div>
            <div className="inputgroup">
                <label htmlFor="end">Année fin</label>
                <input
                    className="field date"
                    name="end"
                    type="number"
                    min="1900"
                    max="2099"
                    placeholder="2020"
                    onChange={handleChange}
                />
            </div>
            <div className="inputgroup especegroup">
                <label htmlFor="espece">Espèce</label>
                <input
                    onKeyDown={onKeyDown}
                    className="field espece"
                    name="espece"
                    type="text"
                    placeholder="crabs"
                    onChange={handleAutocomplete}
                    value={form.espece}
                />
                {autocomplete && (
                    <div className="autocomplete">
                        <div className="autocompleteItems">
                            {autocompleteList.length > 0 ? (
                                autocompleteList.map((elem, i) => (
                                    <div
                                        key={elem.id}
                                        className={
                                            cursor === i
                                                ? "autocompleteItem active"
                                                : "autocompleteItem"
                                        }
                                        onClick={handleSearch}
                                        data-name={elem.espece}
                                        data-id={elem.id}
                                    >
                                        {elem.espece}
                                    </div>
                                ))
                            ) : (
                                <div className="autocompleteItem">
                                    No result
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <button className="field submit" onClick={handleSubmitButton}>
                <i className="fas fa-search" style={{ color: "#fff" }}></i>
            </button>
        </form>
    );
}

export default MyForm;
