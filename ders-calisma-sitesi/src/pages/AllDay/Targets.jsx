import React, { useState } from "react";

const Personal = () => {
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState('');

    // Hedef ekleme işlevi
    const addGoal = () => {
        if (newGoal.trim()) {
            setGoals([...goals, newGoal.trim()]);
            setNewGoal('');
        }
    };

    // Hedef silme işlevi
    const deleteGoal = (index) => {
        setGoals(goals.filter((_, i) => i !== index));
    };

    return (
        <div className="mt-[70px] bg-white p-5 rounded-3xl shadow-md w-full max-w-[1163px] flex flex-col items-center space-y-8 mx-auto">
            <div className="w-full flex flex-col items-center space-y-4">
                <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                    Hedeflerinizi Belirleyin!
                </h2>
                <p className="mt-2 text-lg text-gray-800 max-w-lg mx-auto bg-gradient-to-r from-green-50 to-white p-6 rounded-lg shadow-md border border-green-100">
                    🎯 Hedeflerinizi yazın, kaydedin!
                </p>

                {/* Hedef Ekleme Alanı */}
                <div className="mt-4 w-full max-w-md">
                    <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Yeni hedefinizi yazın..."
                        className="w-full p-4 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        onClick={addGoal}
                        className="bg-[#00BFFF] hover:bg-[#0099CC] text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 mt-4 w-full"
                    >
                        Hedef Ekle
                    </button>
                </div>

                {/* Hedefler Listesi */}
                <div className="w-full flex flex-col space-y-4 mt-8">
                    <h3 className="text-lg font-bold text-gray-700">Hedefleriniz</h3>
                    <div className="w-full max-h-[350px] overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">
                        {goals.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {goals.map((goal, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-xl shadow-lg bg-white flex flex-col justify-between"
                                    >
                                        <span className="text-gray-800 text-sm">{goal}</span>
                                        <div className="flex justify-between mt-4">
                                            <button
                                                onClick={() => deleteGoal(index)}
                                                className="mt-4 ml-[-9px] bg-red-500 hover:bg-red-600 text-white font-bold  py-3 px-40 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center">Henüz bir hedef eklenmedi.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Personal;
