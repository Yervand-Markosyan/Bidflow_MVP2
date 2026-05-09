import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const RedirectHandler: React.FC = () => {
    const { shortId } = useParams<{ shortId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDestination = async () => {
            if (!shortId) {
                navigate('/');
                return;
            }

            try {
                // Backend URL needs to be configured, but for now using the requested pattern
                const response = await fetch(`/api/resolve-url?slug=${shortId}`);
                const data = await response.json();
                
                if (data.destinationUrl) {
                    window.location.href = data.destinationUrl;
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Failed to resolve URL', error);
                navigate('/');
            }
        };

        fetchDestination();
    }, [shortId, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen text-white bg-black">
            <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
    );
};
