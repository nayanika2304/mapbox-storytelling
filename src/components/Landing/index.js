import React,{useEffect,useState} from "react";
import { Navigation } from "./Navigation";
import { Header } from "./Header";
import { Features } from "./Features";
import { About } from "./About";
import {Services} from "./Services"
import { Gallery } from "./Gallery";
import {Testimonials} from "./Testimonials"
import { Team } from "./Team";
import {Contact} from "./Contact"
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
            <Services data={landingPageData.Services}/>
            <Gallery data={landingPageData.Gallery}/>
            <Testimonials data={landingPageData.Testimonials} />
            <Team data={landingPageData.Team} />
            <Contact data={landingPageData.Contact} />
        </div>
    )
}

