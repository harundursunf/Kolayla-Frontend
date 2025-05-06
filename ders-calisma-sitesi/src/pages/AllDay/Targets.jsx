import React, { useState, useEffect } from "react";
import axios from "axios";

const Personal = () => {
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState('');
    const [isPriority, setIsPriority] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const getUserIdFromToken = (token) => {
        if (!token) return null;
        try {
            const payload = token.split(".")[1];
            const decodedPayload = JSON.parse(atob(payload));
            return decodedPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        } catch (error) {
            console.error("Token decode edilemedi:", error);
            return null;
        }
    };

    const userId = getUserIdFromToken(localStorage.getItem('token'));
    const API_URL = 'https://localhost:5001/api/DailyGoal'; // API URL

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setGoals(response.data);
        } catch (error) {
            console.error('Hedefler alınamadı:', error);
        }
    };

    const handleAddGoal = async () => {
        const token = localStorage.getItem("token");

        if (newGoal.trim()) {
            const goal = {
                userId,
                text: newGoal,
                isPriority,
                createdDate: new Date().toISOString()
            };

            try {
                await axios.post(`${API_URL}/add`, goal, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                fetchGoals();
                setNewGoal('');
                setIsPriority(false);
            } catch (error) {
                console.error('Hedef eklenemedi:', error);
            }
        }
    };

    const handleDeleteGoal = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchGoals();
        } catch (error) {
            console.error('Hedef silinemedi:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredGoals = goals.filter(goal =>
        goal.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mt-[70px] bg-white p-5 rounded-3xl shadow-md w-full max-w-[1163px] flex flex-col items-center space-y-8 mx-auto">
            <div className="w-full flex flex-col items-center space-y-4">
                <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600">
                    Hedeflerinizi Belirleyin!
                </h2>
                <p className="mt-2 text-lg text-gray-800 max-w-lg mx-auto bg-gradient-to-r from-green-50 to-white p-6 rounded-lg shadow-md border border-green-100">
                    🎯 Hedeflerinizi yazın, kaydedin!
                </p>

                <div className="mt-4 w-full max-w-md">
                    <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Yeni hedefinizi yazın..."
                        className="w-full p-4 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    
                    <button
                        onClick={handleAddGoal}
                        className="bg-[#00BFFF] hover:bg-[#0099CC] text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 mt-4 w-full"
                    >
                        Hedef Ekle
                    </button>
                </div>

                <div className="mt-4 w-full max-w-md">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Hedefleri ara..."
                        className="w-full p-4 rounded-lg border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                </div>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                {filteredGoals.length > 0 ? (
                    filteredGoals.map((goal) => (
                        <div
                            key={goal.id}
                            className="p-4 rounded-lg shadow-md flex flex-col justify-between border bg-white"
                        >
                            <div>
                                <div className="flex items-center space-x-2">
                                    {goal.isPriority && (
                                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                                    )}
                                    <span className="text-gray-800">{goal.text}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-2">Tarih: {new Date(goal.createdDate).toLocaleDateString()}</div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <button
                                    onClick={() => handleDeleteGoal(goal.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full shadow-lg"
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center">Henüz bir hedef eklenmedi.</p>
                )}
            </div>
        </div>
    );
};

export default Personal;
