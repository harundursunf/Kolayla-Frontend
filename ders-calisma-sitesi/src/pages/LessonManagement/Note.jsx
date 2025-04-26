import React, { useState } from 'react';

const Notlarım = () => {
    const [notes, setNotes] = useState([]);
    const [note, setNote] = useState('');
    const [isPriority, setIsPriority] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddNote = () => {
        if (note.trim()) {
            setNotes([...notes, { text: note, isPriority, date: new Date().toLocaleDateString(), isFavorite: false }]);
            setNote('');
            setIsPriority(false);
        }
    };

    const handleDeleteNote = (index) => {
        const updatedNotes = notes.filter((_, i) => i !== index);
        setNotes(updatedNotes);
    };

    const handleToggleFavorite = (index) => {
        const updatedNotes = [...notes];
        updatedNotes[index].isFavorite = !updatedNotes[index].isFavorite;
        setNotes(updatedNotes);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mt-[150px] bg-white p-5 rounded-3xl shadow-md w-full max-w-[1163px] flex flex-col items-center space-y-8 mx-auto">
            <div className="w-full flex flex-col items-center space-y-4">
                <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                    Hedeflerinizi Not Alın!
                </h2>

                <div className="mt-4 w-full max-w-md">
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Bir not ekleyin..."
                        className="w-full p-4 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            checked={isPriority}
                            onChange={(e) => setIsPriority(e.target.checked)}
                            className="mr-2 accent-red-500 w-5 h-5"
                        />
                        <label className="text-gray-700 font-medium">Öncelikli</label>
                    </div>
                    <button
                        onClick={handleAddNote}
                        className="bg-[#00BFFF] hover:bg-[#0099CC] text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 mt-4 w-full"
                    >
                        Not Ekle
                    </button>
                </div>

                <div className="mt-4 w-full max-w-md">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Notları ara..."
                        className="w-full p-4 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                </div>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map((note, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-lg shadow-md flex flex-col justify-between border bg-white"
                        >
                            <div>
                                <div className="flex items-center space-x-2">
                                    {note.isPriority && (
                                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                                    )}
                                    <span className="text-gray-800">{note.text}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-2">Tarih: {note.date}</div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <button
                                    onClick={() => handleToggleFavorite(index)}
                                    className={`font-bold py-1 px-3 rounded-full ${note.isFavorite ? 'text-yellow-500' : 'text-gray-500'}`}
                                >
                                    {note.isFavorite ? '⭐' : 'Favori'}
                                </button>
                                <button
                                    onClick={() => handleDeleteNote(index)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full shadow-lg"
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center">Henüz bir not eklenmedi.</p>
                )}
            </div>
        </div>
    );
};

export default Notlarım;
