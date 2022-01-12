import React, { useState } from 'react';
function MyForm() {
    const [form, setForm] = useState({ espece: "", start: 0, end: 0 });
    const [autocomplete, setAutocomplete] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        console.log(form);
        if (form.espece.length > 3) {
            setAutocomplete(true);
        } else {
            setAutocomplete(false);
        }
    }
    const handleSubmit = () => { console.log(process.env.API_URL) }

    const onSubmit = (e) => { e.preventDefault(); };

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
                <input className="field espece" name="espece" type="text" placeholder='crabs' onChange={handleChange} />
                {autocomplete && <div className='autocomplete'>
                    <div className='autocompleteItems'>
                        <div className='autocompleteItem'>uwu</div>
                        <div className='autocompleteItem'>uwu2</div>
                        <div className='autocompleteItem'>uwu3</div>
                    </div>
                </div>}
            </div>
            <button className="field submit" onClick={handleSubmit}><i className="fas fa-search" style={{ color: "#fff" }}></i></button>
        </form>
    );
}

export default MyForm;