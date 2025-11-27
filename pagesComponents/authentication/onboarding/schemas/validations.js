/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023Adele.ai(https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import * as Yup from "yup";
import checkout from "/pagesComponents/authentication/onboarding/schemas/form";

const {
  formField: {
    companyUrl,
    position,
  },
} = checkout;

// Fonction pour normaliser l'URL avant validation
const normalizeUrl = (url) => {
  if (!url) return url;
  
  let normalized = url.trim();
  
  // Si pas de protocole, ajouter https://
  if (!normalized.match(/^https?:\/\//i)) {
    // Si commence par www., ajouter https://
    if (normalized.match(/^www\./i)) {
      normalized = `https://${normalized}`;
    } else {
      // Sinon, ajouter https://
      normalized = `https://${normalized}`;
    }
  }
  
  // Enlever le trailing slash
  normalized = normalized.replace(/\/$/, "");
  
  return normalized;
};

const validations = Yup.object().shape({
  [companyUrl.name]: Yup.string()
    .required(companyUrl.errorMsg)
    .transform((value) => normalizeUrl(value)) // Normaliser avant validation
    .test(
      "is-valid-url",
      companyUrl.invalidMsg,
      (value) => {
        if (!value) return false;
        try {
          const url = new URL(value);
          // Vérifier que c'est http ou https
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      }
    ),
  [position.name]: Yup.string().required(position.errorMsg),
  positionCustom: Yup.string().when("position", {
    is: "Other",
    then: (schema) => schema.required("Please specify your position"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default validations;

