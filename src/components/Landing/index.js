import React,{useEffect,useState} from "react";
import { Navigation } from "./Navigation";
import { Header } from "./Header";
import { Features } from "./Features";
import { About } from "./About";
import JsonData from '../../data/data.json'

export const Landing = () => {
    const [landingPageData, setLandingPageData] = useState({});
    useEffect(() => {
        setLandingPageData(JsonData);
    }, []);
    return (
        <div>
            <Navigation/>
            <Header data={landingPageData.Header}/>
            <Features data={landingPageData.Features}/>
            <About data={landingPageData.About}/>
        </div>
    )
}

