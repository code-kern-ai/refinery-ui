import { useState } from 'react';
import style from '@/src/styles/components/projects/projects-list.module.css';

const YOUTUBE_URL = "https://www.youtube.com/embed/Hwlu6GWzDH8?autoplay=1&enablejsapi=1";

export default function YoutubeIntroduction() {
    const [saveUrl, setSaveUrl] = useState(null);

    function startPlayback() {
        setSaveUrl(YOUTUBE_URL);
    }

    return (
        <div style={{ width: '560px', height: '315px' }} className={`overflow-hidden relative ${style.imageVideo}`}>
            {saveUrl ? (<iframe width="560" height="315" src={saveUrl} title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen></iframe>) : (
                <div>
                    <img src="/refinery/images/thumbnail.jpg" style={{ width: '100%', position: 'relative' }} />
                    <span className="absolute inset-0 w-full h-full flex items-center justify-center"
                        aria-hidden="true">
                        <svg onClick={startPlayback} className="cursor-pointer h-20 w-20 text-indigo-500" fill="currentColor"
                            viewBox="0 0 84 84">
                            <circle opacity="0.9" cx="42" cy="42" r="42" fill="white" />
                            <path
                                d="M55.5039 40.3359L37.1094 28.0729C35.7803 27.1869 34 28.1396 34 29.737V54.263C34 55.8604 35.7803 56.8131 37.1094 55.9271L55.5038 43.6641C56.6913 42.8725 56.6913 41.1275 55.5039 40.3359Z" />
                        </svg>
                    </span>
                </div>)}
        </div>
    )
}