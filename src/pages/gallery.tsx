// about.jsx
import React, { useEffect } from "react";

import "../styles/gallery.css";
import Contacts from "../components/contacts";

export default function Gallery() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="galleryPage">
      <div className="gallery">
        <div className="gallery-placeholder">
          <p>Gallery placeholder - will be replaced with shadcn components</p>
        </div>
      </div>
      <Contacts />
    </div>
  );
}
