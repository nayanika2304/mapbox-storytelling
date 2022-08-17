import React, { useRef, useEffect, useState } from 'react';
import {config} from '../config'
import '../Map.css'
import { alignments } from '../constants/attributes';

export const Features = () =>{
    return (
        <div id='features' className='features'>
                {
                    config.chapters.map((record,idx) =>{
                        return (
                            <div id='container' className={`step ${idx === 0? 'active' : null} ${record.hidden ? 'hidden' : null} ${alignments[record.alignment] || 'centered'}`}>
                            <div id='chapter'>
                                Title: <h3 id='title'>{record.title}</h3>
                                <image src={record.image}></image>
                                Description: <p>{record.description}</p>
                            </div>
                        </div>
                        )
                    })
                }
            </div>
    )
}