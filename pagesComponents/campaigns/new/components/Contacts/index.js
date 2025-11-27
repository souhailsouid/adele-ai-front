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

import { useState, useRef, useEffect } from "react";

// prop-type is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Icon from "@mui/material/Icon";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

// formik components
import { useField } from "formik";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

// NextJS Material Dashboard 2 PRO examples
import DataTable from "/examples/Tables/DataTable";

// Campaign page components
import FormField from "/pagesComponents/campaigns/new/components/FormField";

// Fonction pour parser le CSV de manière robuste
function parseCSV(text) {
  // Nettoyer le texte (enlever BOM UTF-8 si présent)
  const cleanText = text.replace(/^\uFEFF/, "");
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim());
  
  if (lines.length === 0) return { headers: [], rows: [] };

  // Détecter le séparateur (virgule, point-virgule, ou tabulation)
  const firstLine = lines[0];
  let separator = ",";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  if (tabCount > commaCount && tabCount > semicolonCount) {
    separator = "\t";
  } else if (semicolonCount > commaCount) {
    separator = ";";
  }

  // Parser les headers en gérant les guillemets
  const parseCSVLine = (line) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Guillemet échappé
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === separator && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseCSVLine(firstLine).map((h) => 
    h.replace(/^"|"$/g, "").trim()
  );

  // Parser les lignes
  const rows = lines.slice(1)
    .filter((line) => line.trim()) // Ignorer les lignes vides
    .map((line) => {
      const values = parseCSVLine(line);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = (values[index] || "").replace(/^"|"$/g, "").trim();
      });
      return row;
    })
    .filter((row) => {
      // Filtrer les lignes complètement vides
      return Object.values(row).some((val) => val && val.trim());
    });

  return { headers, rows };
}

// Fonction pour mapper les colonnes CSV aux champs de contact
function mapCSVToContacts(csvData) {
  const { headers, rows } = csvData;
  
  // Mapping des colonnes possibles (pour validation)
  const fieldMappings = {
    firstName: ["first name", "firstname", "prénom", "prenom", "fname", "given name"],
    lastName: ["last name", "lastname", "nom", "surname", "lname", "family name"],
    email: ["email", "e-mail", "email address", "courriel", "mail"],
    company: ["company", "company name", "entreprise", "organization", "org", "firm"],
    title: ["title", "job title", "position", "role", "fonction", "poste"],
    phone: ["phone", "telephone", "phone number", "téléphone", "mobile", "cell"],
    linkedin: ["linkedin", "linkedin url", "linkedin profile"],
    website: ["website", "company website", "site web", "url"],
  };

  // Trouver les mappings (pour validation email)
  const columnMapping = {};
  headers.forEach((header) => {
    const lowerHeader = header.toLowerCase().trim();
    Object.keys(fieldMappings).forEach((field) => {
      if (fieldMappings[field].some((alias) => lowerHeader.includes(alias))) {
        columnMapping[field] = header;
      }
    });
  });

  // Extraire les contacts (garder toutes les colonnes du CSV)
  const contacts = rows
    .filter((row) => {
      // Filtrer les lignes vides ou sans email
      const emailColumn = columnMapping.email || headers.find(h => 
        h.toLowerCase().includes("email") || h.toLowerCase().includes("mail")
      );
      const email = emailColumn ? row[emailColumn] || "" : "";
      return email && email.includes("@");
    })
    .map((row) => {
      // Garder toutes les colonnes du CSV
      const contact = {};
      headers.forEach((header) => {
        contact[header] = row[header] || "";
      });
      return contact;
    });

  return { contacts, columnMapping, totalRows: rows.length, headers };
}

function Contacts({ formData }) {
  const { formField, values, errors, touched, setFieldValue } = formData;
  const { contacts } = formField;
  const [field, meta] = useField(contacts.name);
  
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const fileInputRef = useRef(null);
  const hasRestoredData = useRef(false);

  // Restaurer les données depuis le formulaire au montage (une seule fois)
  useEffect(() => {
    if (hasRestoredData.current) return; // Ne restaurer qu'une fois
    
    const savedContactsList = values.selectedContactsList;
    const savedParsedData = values.parsedContactsData;
    
    if (savedParsedData && savedContactsList && savedContactsList.length > 0) {
      // Restaurer les données parsées
      setParsedData(savedParsedData);
      
      // Restaurer les sélections
      const savedSelected = new Set();
      savedContactsList.forEach((selectedContact) => {
        // Trouver l'index dans parsedData.contacts
        const contactIndex = savedParsedData.contacts.findIndex((contact) => {
          // Comparer par email (ou autre identifiant unique)
          const emailHeader = savedParsedData.headers.find(h => 
            h.toLowerCase().includes("email") || h.toLowerCase().includes("mail")
          );
          if (emailHeader) {
            return contact[emailHeader] === selectedContact[emailHeader];
          }
          // Si pas d'email, comparer toutes les propriétés
          return JSON.stringify(contact) === JSON.stringify(selectedContact);
        });
        if (contactIndex !== -1) {
          savedSelected.add(contactIndex);
        }
      });
      setSelectedContacts(savedSelected);
      
      // Restaurer le fichier (nom seulement)
      if (savedParsedData.fileName) {
        setFile({ name: savedParsedData.fileName });
      }
      
      hasRestoredData.current = true;
    }
  }, [values.selectedContactsList, values.parsedContactsData]);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Vérifier le type de fichier
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".csv",
    ];
    
    const fileName = selectedFile.name.toLowerCase();
    const isValidFile = 
      fileName.endsWith(".csv") || 
      fileName.endsWith(".xlsx") || 
      fileName.endsWith(".xls");

    if (!isValidFile) {
      setError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);
    hasRestoredData.current = false; // Réinitialiser pour permettre une nouvelle restauration après upload

    try {
      // Lire le fichier
      const text = await selectedFile.text();
      
      // Parser le CSV
      const csvData = parseCSV(text);
      
      if (csvData.rows.length === 0) {
        setError("The CSV file appears to be empty or invalid.");
        setIsProcessing(false);
        return;
      }

      // Mapper les données aux contacts
      const { contacts: extractedContacts, columnMapping, totalRows, headers } = mapCSVToContacts(csvData);

      if (extractedContacts.length === 0) {
        setError("No valid contacts found. Please ensure your CSV contains email addresses.");
        setIsProcessing(false);
        return;
      }

      // Par défaut, tous les contacts sont sélectionnés
      const allSelected = new Set(extractedContacts.map((_, index) => index));
      setSelectedContacts(allSelected);

      const parsedDataToSave = {
        contacts: extractedContacts,
        columnMapping,
        totalRows,
        validContacts: extractedContacts.length,
        rawData: extractedContacts, // Stocker les données brutes pour utilisation ultérieure
        headers, // Stocker les headers pour générer les colonnes dynamiquement
        fileName: selectedFile.name, // Sauvegarder le nom du fichier
      };

      setParsedData(parsedDataToSave);

      // Mettre à jour le nombre de contacts dans le formulaire (tous sélectionnés par défaut)
      setFieldValue(contacts.name, extractedContacts.length);
      
      // Stocker les contacts sélectionnés dans le formulaire
      setFieldValue("selectedContactsList", extractedContacts);
      
      // Stocker les données parsées dans le formulaire pour persistance
      setFieldValue("parsedContactsData", parsedDataToSave);
      
    } catch (err) {
      console.error("Error parsing CSV:", err);
      setError("Error parsing the file. Please check the format and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const syntheticEvent = {
        target: { files: [droppedFile] },
      };
      handleFileSelect(syntheticEvent);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    setSelectedContacts(new Set());
    setFieldValue(contacts.name, "");
    setFieldValue("selectedContactsList", []);
    setFieldValue("parsedContactsData", null);
    hasRestoredData.current = false; // Réinitialiser pour permettre une nouvelle restauration
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Gérer la sélection d'un contact individuel
  const handleToggleContact = (index) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedContacts(newSelected);
    
    // Mettre à jour les contacts sélectionnés dans le formulaire
    if (parsedData) {
      const selectedList = parsedData.contacts.filter((_, i) => newSelected.has(i));
      setFieldValue(contacts.name, selectedList.length);
      setFieldValue("selectedContactsList", selectedList);
      // Mettre à jour aussi les données parsées
      setFieldValue("parsedContactsData", parsedData);
    }
  };

  // Gérer la sélection/désélection de tous les contacts
  const handleSelectAll = (checked) => {
    if (checked) {
      const allSelected = new Set(parsedData.contacts.map((_, index) => index));
      setSelectedContacts(allSelected);
      setFieldValue(contacts.name, parsedData.contacts.length);
      setFieldValue("selectedContactsList", parsedData.contacts);
      // Mettre à jour aussi les données parsées
      setFieldValue("parsedContactsData", parsedData);
    } else {
      setSelectedContacts(new Set());
      setFieldValue(contacts.name, 0);
      setFieldValue("selectedContactsList", []);
      // Mettre à jour aussi les données parsées
      setFieldValue("parsedContactsData", parsedData);
    }
  };

  // Vérifier si tous les contacts sont sélectionnés
  const isAllSelected = parsedData && selectedContacts.size === parsedData.contacts.length && parsedData.contacts.length > 0;
  const isIndeterminate = parsedData && selectedContacts.size > 0 && selectedContacts.size < parsedData.contacts.length;

  return (
    <MDBox>
      <MDBox lineHeight={0} mb={3}>
        <MDTypography variant="h5" fontWeight="medium">
          Step 3 Contacts
        </MDTypography>
        <MDTypography variant="button" color="text">
          Upload your contact list in CSV or Excel format. The AI will intelligently parse it.
        </MDTypography>
      </MDBox>

      {/* Zone d'upload */}
      <MDBox mb={3}>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            border: "2px dashed #d2d6da",
            borderRadius: 2,
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#0EB1EC",
              bgcolor: "rgba(14, 177, 236, 0.02)",
            },
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          
          <Icon sx={{ fontSize: 64, color: "#d2d6da", mb: 2 }}>cloud_upload</Icon>
          <MDTypography variant="h6" fontWeight="medium" mb={1}>
            {file ? file.name : "Drag and drop your file here, or click to upload"}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Supports CSV and Excel files (.csv, .xlsx, .xls)
          </MDTypography>
          
          {isProcessing && (
            <MDBox mt={2}>
              <MDTypography variant="caption" color="text">
                Processing file...
              </MDTypography>
            </MDBox>
          )}
        </Paper>

        {file && !isProcessing && (
          <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="body2" color="text">
              {file.name} ({parsedData ? `${parsedData.validContacts} contacts found` : "Processing..."})
            </MDTypography>
            <MDButton
              size="small"
              variant="text"
              color="error"
              onClick={handleRemoveFile}
            >
              Remove
            </MDButton>
          </MDBox>
        )}
      </MDBox>

      {/* Messages d'erreur */}
      {error && (
        <MDBox mb={3}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </MDBox>
      )}

      {/* Info sur le format flexible */}
      {!parsedData && !error && (
        <MDBox mb={3}>
          <Alert severity="info" icon={<Icon>info</Icon>}>
            <MDTypography variant="h6" fontWeight="medium" mb={0.5}>
              Flexible Format
            </MDTypography>
            <MDTypography variant="body2">
              The AI will automatically identify columns like &apos;First Name&apos;, &apos;Email Address&apos;, &apos;Company Name&apos;. The order does not matter.
            </MDTypography>
          </Alert>
        </MDBox>
      )}

      {/* Aperçu des contacts extraits avec DataTable */}
      {parsedData && parsedData.contacts.length > 0 && parsedData.headers && (
        <MDBox mb={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDBox>
              <MDTypography variant="h6" fontWeight="medium">
                Extracted Contacts ({parsedData.validContacts} of {parsedData.totalRows} rows)
              </MDTypography>
              <MDTypography variant="caption" color="text" mt={0.5} display="block">
                Select the contacts you want to include in this campaign
              </MDTypography>
            </MDBox>
            <Chip
              label={`${selectedContacts.size} selected`}
              color={selectedContacts.size > 0 ? "success" : "default"}
              size="small"
            />
          </MDBox>
          
          <Card>
            <DataTable
              table={{
                columns: [
                  {
                    Header: (
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        color="primary"
                      />
                    ),
                    accessor: "select",
                    width: "5%",
                    Cell: ({ row }) => {
                      const rowIndex = row.original._originalIndex;
                      return (
                        <Checkbox
                          checked={selectedContacts.has(rowIndex)}
                          onChange={() => handleToggleContact(rowIndex)}
                          color="primary"
                        />
                      );
                    },
                  },
                  ...parsedData.headers.map((header) => {
                    // Formater le header pour un affichage plus lisible
                    const formattedHeader = header
                      .split(/[\s_-]+/)
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(" ");
                    
                    return {
                      Header: formattedHeader,
                      accessor: header,
                      width: header.length > 20 ? "25%" : "auto",
                    };
                  }),
                ],
                rows: parsedData.contacts.map((contact, index) => {
                  const row = { _originalIndex: index };
                  parsedData.headers.forEach((header) => {
                    const value = contact[header];
                    row[header] = value && value.trim() ? value.trim() : "-";
                  });
                  return row;
                }),
              }}
              canSearch
              entriesPerPage={{
                defaultValue: 10,
                entries: [5, 10, 15, 20, 25],
              }}
              showTotalEntries
              isSorted={false}
              noEndBorder
            />
          </Card>
          
          <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="body2" color="text">
              {selectedContacts.size} of {parsedData.contacts.length} contacts selected
            </MDTypography>
            <MDBox display="flex" gap={1}>
              <MDButton
                size="small"
                variant="outlined"
                onClick={() => handleSelectAll(true)}
              >
                Select All
              </MDButton>
              <MDButton
                size="small"
                variant="outlined"
                onClick={() => handleSelectAll(false)}
              >
                Deselect All
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      )}

    </MDBox>
  );
}

// typechecking props for Contacts
Contacts.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default Contacts;
