import React, { useRef, useEffect, useState } from 'react';
import {config} from '../config'
import '../Map.css'
import { Features } from '../Features';

export const Story = () =>{
    return (
       <div>
        <h1>{config.title}</h1>
        <h2>{config.subtitle}</h2>
        <p>{config.byline}</p>
        <Features/>
        <div className={`footer ${config.theme}`}>
            <p>{config.footer}</p>
        </div>
       </div>
    )
}