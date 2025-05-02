import React from 'react';
import Header from './Header'; // Header bileşenini içe aktar


const MainLayout = ({ children }) => {
    return (
        <>
            <Header /> 
            <main>{children}</main> 
          
        </>
    );
};

export default MainLayout;
