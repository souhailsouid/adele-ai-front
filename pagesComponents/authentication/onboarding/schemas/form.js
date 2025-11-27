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

const form = {
  formId: "onboarding-form",
  formField: {
    companyUrl: {
      name: "companyUrl",
      label: "Company Website URL",
      type: "url",
      errorMsg: "Company URL is required.",
      invalidMsg: "Please enter a valid URL.",
    },
    position: {
      name: "position",
      label: "Position / Role in Company",
      type: "text",
      errorMsg: "Position is required.",
    },
  },
};

export default form;


