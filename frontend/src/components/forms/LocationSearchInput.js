import React, { useEffect, useMemo, useRef, useState } from "react";

const SCRIPT_ID = "google-maps-places-script";

function ensureGoogleScript(apiKey) {
  if (!apiKey) {
    return Promise.resolve(false);
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function LocationSearchInput({ value, onChange, onSelect }) {
  const [predictions, setPredictions] = useState([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const service = useMemo(() => {
    if (!ready || !window.google?.maps?.places) {
      return null;
    }
    return new window.google.maps.places.AutocompleteService();
  }, [ready]);

  useEffect(() => {
    let mounted = true;
    ensureGoogleScript(apiKey).then((ok) => {
      if (mounted && ok) {
        setReady(true);
      }
    });
    return () => {
      mounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [apiKey]);

  useEffect(() => {
    if (!service || !value || value.trim().length < 3) {
      setPredictions([]);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      service.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "za" },
        },
        (results) => {
          setPredictions(results || []);
        },
      );
    }, 250);
  }, [value, service]);

  const handlePick = (prediction) => {
    onChange(prediction.description);
    setOpen(false);
    setPredictions([]);
    if (onSelect) {
      onSelect(prediction);
    }
  };

  if (!apiKey) {
    return (
      <input
        className="input"
        placeholder="Location (Google Maps API key not configured)"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <div className="location-search">
      <input
        className="input"
        placeholder="Search address or suburb"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && predictions.length > 0 ? (
        <div className="location-results">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              className="location-result-item"
              onClick={() => handlePick(prediction)}
            >
              {prediction.description}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
