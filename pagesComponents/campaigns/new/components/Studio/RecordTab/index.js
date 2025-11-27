

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

// prop-type is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Icon from "@mui/material/Icon";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

// Webcam component - dynamic import for Next.js SSR
const Webcam = dynamic(() => import("react-webcam"), {
  ssr: false,
  loading: () => (
    <MDBox
      sx={{
        width: "100%",
        height: 400,
        bgcolor: "#000",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MDTypography variant="body2" color="#fff">
        Loading camera...
      </MDTypography>
    </MDBox>
  ),
});

function RecordTab({ formData }) {
  const { values, setFieldValue } = formData;
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(values.masterVideo || null);
  const [cameraPermission, setCameraPermission] = useState(null); // null, 'granted', 'denied'
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState({
    camera: false,
    microphone: false,
  });
  const [recordingChecks, setRecordingChecks] = useState({
    position: true,
    lighting: true,
    audio: false, // Will be checked when mic is active
  });
  const [script, setScript] = useState(null); // Script généré (peut être amélioré par IA)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptHistory, setScriptHistory] = useState([]); // Historique des versions du script
  const [showTeleprompter, setShowTeleprompter] = useState(false); // Afficher le téléprompter sur la webcam
  const [showVideoPreview, setShowVideoPreview] = useState(true); // Afficher la prévisualisation vidéo
  const [isFullscreen, setIsFullscreen] = useState(false); // Mode plein écran
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(50); // Vitesse de défilement (0-100)
  const [teleprompterPositionY, setTeleprompterPositionY] = useState(85); // Position verticale (0-100) - par défaut en bas
  const [teleprompterPositionX, setTeleprompterPositionX] = useState(50); // Position horizontale (0-100) - centré
  const [teleprompterScroll, setTeleprompterScroll] = useState(0); // Position de défilement actuelle
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0); // Index de la section actuellement affichée

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const teleprompterRef = useRef(null);

  // Générer le script de base avec placeholders
  const generateBaseScript = useCallback(() => {
    const structureData = values.videoStructureData;
    if (!structureData) {
      return {
        full: "Please select a pitch structure first.",
        sections: [],
      };
    }

    const senderName = values.senderName || "{nom_expéditeur}";
    const companyName = values.companyInfo?.split("\n")[0] || "our company";
    const campaignObjective = values.campaignObjective || "Lead Generation";

    // Générer les sections du script basées sur les données de la campagne
    const sections = structureData.segments.map((segment) => {
      let content = "";
      switch (segment.name) {
        case "Problem":
          content = `I know you're facing challenges in your industry. Many companies struggle with ${campaignObjective.toLowerCase()} and finding the right approach to grow their business.`;
          break;
        case "Solution":
          content = `At ${companyName}, we specialize in transforming your ${campaignObjective.toLowerCase()} strategy. We help businesses like yours to streamline their processes and ensure every lead counts. In fact, did you know that {context_fact}?`;
          break;
        case "Proof":
          content = `Companies like {info_contexte} trust us to deliver results.`;
          break;
        case "CTA":
          content = `I'd love to show you how we can specifically help {company}. How about a quick 15-minute chat to see if our tailored approach aligns with your goals, or simply request our free ${campaignObjective.toLowerCase()} audit?`;
          break;
        case "Hook":
          content = `Did you know that most companies waste 73% of their marketing budget on strategies that don't convert?`;
          break;
        case "Value":
          content = `We've developed a proven system that helps companies like {company} achieve ${campaignObjective.toLowerCase()} results in just 30 days.`;
          break;
        case "Story":
          content = `Last month, we helped a company similar to {company} overcome the exact challenges you're facing.`;
          break;
        case "Transformation":
          content = `They went from struggling with ${campaignObjective.toLowerCase()} to seeing a 300% increase in qualified leads.`;
          break;
        default:
          content = `${segment.name} content here.`;
      }
      return { name: segment.name, content };
    });

    const fullScript = `Hello {prénom},\n\n${sections.map(s => s.content).join("\n\n")}\n\nBest regards,\n${senderName}`;

    return { full: fullScript, sections };
  }, [values.videoStructureData, values.senderName, values.companyInfo, values.campaignObjective]);

  // Initialiser le script au montage
  useEffect(() => {
    if (!script) {
      const baseScript = generateBaseScript();
      setScript(baseScript);
      setScriptHistory([baseScript]);
    }
  }, [script, generateBaseScript]);

  // Mettre à jour le script quand les valeurs changent (seulement si pas de script amélioré par IA)
  useEffect(() => {
    if (script && values.videoStructureData && scriptHistory.length === 1) {
      const baseScript = generateBaseScript();
      setScript(baseScript);
      setScriptHistory([baseScript]);
    }
  }, [values.videoStructureData, values.senderName, values.companyInfo, values.campaignObjective, generateBaseScript, script, scriptHistory.length]);

  const currentScript = script || generateBaseScript();
  const structureName = values.videoStructureData?.name || "Problem → Solution → Proof → CTA";
  
  // Navigation entre les sections
  const sections = currentScript.sections || [];
  const currentSection = sections[currentSectionIndex] || null;
  const hasNextSection = currentSectionIndex < sections.length - 1;
  const hasPrevSection = currentSectionIndex > 0;

  const handleNextSection = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      setTeleprompterScroll(0); // Reset scroll pour la nouvelle section
    }
  }, [currentSectionIndex, sections.length]);

  const handlePrevSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      setTeleprompterScroll(0); // Reset scroll pour la nouvelle section
    }
  }, [currentSectionIndex]);

  // Construire le prompt pour l'IA avec toutes les données de la campagne
  const buildAIPrompt = () => {
    const structureData = values.videoStructureData;
    const segments = structureData?.segments || [];
    
    const prompt = `You are a professional video script writer. Create a personalized, engaging video script for a sales outreach campaign.

CONTEXT:
- Campaign Objective: ${values.campaignObjective || "Lead Generation"}
- Sender Name: ${values.senderName || "Sales Representative"}
- Sender Title: ${values.senderTitle || ""}
- Company Name: ${values.companyInfo?.split("\n")[0] || "Our Company"}
- Company Description: ${values.companyInfo || ""}
- Target Persona: ${values.targetPersona || "Business decision makers"}
- Language: ${values.language || "English"}

VIDEO STRUCTURE:
${segments.map((seg, i) => `${i + 1}. ${seg.name} (${seg.duration})`).join("\n")}

REQUIREMENTS:
1. Create a natural, conversational script that sounds authentic when spoken
2. Include these placeholders that will be replaced per contact: {prénom}, {company}, {info_contexte}, {context_fact}, {nom_expéditeur}
3. Each section should match its duration (approximately ${segments.map(s => s.duration).join(", ")})
4. Make it personal, engaging, and value-focused
5. The script should flow naturally from one section to the next
6. Use the campaign objective to tailor the messaging

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "sections": [
    {
      "name": "Section Name",
      "content": "The script content for this section"
    }
  ],
  "full": "Complete script with all sections combined"
}

Generate the script now:`;

    return prompt;
  };

  // Améliorer le script avec l'IA
  const improveScriptWithAI = async () => {
    setIsGeneratingScript(true);
    
    try {
      // TODO: Remplacer par un appel API réel (OpenAI, Claude, etc.)
      // Pour l'instant, simulation avec un prompt amélioré
      const prompt = buildAIPrompt();
      
      // Simuler un appel API (à remplacer par un vrai appel)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Pour l'instant, améliorer le script de base avec plus de contexte
      const improvedScript = generateImprovedScript();
      
      setScript(improvedScript);
      setScriptHistory((prev) => [...prev, improvedScript]);
      setFieldValue("videoScript", improvedScript);
      
      // TODO: Appel API réel
      // const response = await fetch('/api/generate-script', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prompt, context: values })
      // });
      // const data = await response.json();
      // setScript(data.script);
      
    } catch (error) {
      console.error("Error generating script:", error);
      alert("Error generating script. Please try again.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Fonction pour générer un script amélioré (simulation - à remplacer par API)
  const generateImprovedScript = () => {
    const structureData = values.videoStructureData;
    if (!structureData) return generateBaseScript();

    const senderName = values.senderName || "{nom_expéditeur}";
    const senderTitle = values.senderTitle || "";
    const companyName = values.companyInfo?.split("\n")[0] || "our company";
    const companyDescription = values.companyInfo || "";
    const campaignObjective = values.campaignObjective || "Lead Generation";
    const targetPersona = values.targetPersona || "business decision makers";

    const sections = structureData.segments.map((segment) => {
      let content = "";
      switch (segment.name) {
        case "Problem":
          content = `Hi {prénom}, I know that companies like {company} often face significant challenges when it comes to ${campaignObjective.toLowerCase()}. Many ${targetPersona} struggle to find effective strategies that actually move the needle.`;
          break;
        case "Solution":
          content = `At ${companyName}, we've developed a proven approach that helps businesses transform their ${campaignObjective.toLowerCase()} results. ${companyDescription ? `We specialize in ${companyDescription.substring(0, 100)}. ` : ""}In fact, did you know that {context_fact}? Our solution specifically addresses the challenges that companies like {company} face every day.`;
          break;
        case "Proof":
          content = `We've helped companies similar to {info_contexte} achieve remarkable results. These aren't just claims—they're real outcomes from businesses that trusted us with their ${campaignObjective.toLowerCase()} strategy.`;
          break;
        case "CTA":
          content = `I'd love to show you how we can specifically help {company} achieve similar results. How about a quick 15-minute conversation to see if our tailored approach aligns with your goals? Or, if you prefer, I can send you our free ${campaignObjective.toLowerCase()} audit—no strings attached.`;
          break;
        case "Hook":
          content = `{prénom}, did you know that most companies waste over 70% of their ${campaignObjective.toLowerCase()} budget on strategies that simply don't convert?`;
          break;
        case "Value":
          content = `At ${companyName}, we've created a system that helps companies like {company} achieve measurable ${campaignObjective.toLowerCase()} results in just 30 days. This isn't theory—it's a proven framework that's working for businesses right now.`;
          break;
        case "Story":
          content = `Let me share something with you, {prénom}. Last month, we worked with a company very similar to {company} that was facing the exact same challenges you might be experiencing.`;
          break;
        case "Transformation":
          content = `Within 30 days, they transformed their ${campaignObjective.toLowerCase()} results, seeing a 300% increase in qualified leads. But more importantly, they found a sustainable system that continues to deliver.`;
          break;
        default:
          content = `${segment.name} content here.`;
      }
      return { name: segment.name, content };
    });

    const fullScript = `Hello {prénom},\n\n${sections.map(s => s.content).join("\n\n")}\n\n${senderTitle ? `Best regards,\n${senderName}\n${senderTitle}` : `Best regards,\n${senderName}`}`;

    return { full: fullScript, sections };
  };

  // Auto-scroll du téléprompter pendant l'enregistrement
  useEffect(() => {
    let interval;
    if (showTeleprompter && isRecording && teleprompterSpeed > 0) {
      interval = setInterval(() => {
        setTeleprompterScroll((prev) => {
          // Limiter le scroll pour ne pas dépasser la longueur du texte
          const maxScroll = teleprompterRef.current?.scrollHeight || 10000;
          return Math.min(prev + (teleprompterSpeed / 20), maxScroll);
        });
      }, 50); // Plus fréquent pour un défilement plus fluide
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showTeleprompter, isRecording, teleprompterSpeed]);

  // Gérer la sortie du plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Drag and drop pour déplacer le téléprompter
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!showTeleprompter) return;
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.parentElement.getBoundingClientRect();
    setDragStart({
      x: e.clientX - (rect.left - container.left + rect.width / 2),
      y: e.clientY - (rect.top - container.top + rect.height / 2),
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !showTeleprompter) return;
    
    const container = document.querySelector('[data-video-container]');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    setTeleprompterPositionX(Math.max(10, Math.min(90, x)));
    setTeleprompterPositionY(Math.max(10, Math.min(90, y)));
  }, [isDragging, showTeleprompter]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Raccourcis clavier pour la navigation en plein écran
  useEffect(() => {
    if (!isFullscreen || !showTeleprompter || sections.length <= 1) return;

    const handleKeyPress = (e) => {
      // Éviter les raccourcis si l'utilisateur est en train de taper dans un input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevSection();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleNextSection();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isFullscreen, showTeleprompter, sections.length, handleNextSection, handlePrevSection]);

  // Vérifier les permissions et le statut des devices
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Vérifier la caméra
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission("granted");
        setDeviceStatus((prev) => ({ ...prev, camera: true }));
        cameraStream.getTracks().forEach((track) => track.stop()); // Arrêter immédiatement

        // Vérifier le microphone
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophonePermission("granted");
        setDeviceStatus((prev) => ({ ...prev, microphone: true }));
        micStream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error("Permission error:", error);
        if (error.name === "NotAllowedError") {
          setCameraPermission("denied");
          setMicrophonePermission("denied");
        }
      }
    };

    checkPermissions();
  }, []);

  // Démarrer l'enregistrement
  const handleStartRecording = useCallback(async () => {
    if (!webcamRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
      });

      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], "master-video.webm", { type: "video/webm" });
        
        setRecordedVideo({ name: "master-video.webm", url, file });
        setFieldValue("masterVideo", file);
        
        // Arrêter tous les tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingChecks((prev) => ({ ...prev, audio: true }));
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Error accessing camera/microphone. Please check permissions.");
    }
  }, [setFieldValue]);

  // Arrêter l'enregistrement
  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Gérer le clic sur une section du script
  const handleSectionClick = (sectionName) => {
    // Scroll vers la section dans le téléprompter (à implémenter si nécessaire)
    console.log("Scroll to section:", sectionName);
  };

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={1}>
          5. Record Your Master Video
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Record yourself reading the script. The AI will personalize it for each contact using lip-sync technology.
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        {/* Left Panel - Video Recording */}
        <Grid item xs={12} md={7}>
          <Card sx={{ border: "1px solid #e0e0e0", borderRadius: 2, height: "100%" }}>
            <CardContent>
              {/* Device Status Indicators */}
              <MDBox display="flex" gap={2} mb={2}>
                <MDBox display="flex" alignItems="center" gap={1}>
                  <Icon
                    sx={{
                      color: deviceStatus.camera ? "#4caf50" : "#f44336",
                      fontSize: 20,
                    }}
                  >
                    {deviceStatus.camera ? "check_circle" : "error"}
                  </Icon>
                  <MDTypography variant="caption" fontWeight="medium">
                    Camera
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" gap={1}>
                  <Icon
                    sx={{
                      color: deviceStatus.microphone ? "#4caf50" : "#f44336",
                      fontSize: 20,
                    }}
                  >
                    {deviceStatus.microphone ? "check_circle" : "error"}
                  </Icon>
                  <MDTypography variant="caption" fontWeight="medium">
                    Microphone
                  </MDTypography>
                </MDBox>
              </MDBox>

              {/* Video Preview with Teleprompter */}
              <MDBox
                data-video-container
                sx={{
                  width: "100%",
                  bgcolor: "#000",
                  borderRadius: 2,
                  overflow: "hidden",
                  mb: 2,
                  minHeight: 400,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cameraPermission === "denied" ? (
                  <Alert
                    severity="error"
                    sx={{
                      m: 2,
                      width: "calc(100% - 32px)",
                      bgcolor: "#fff",
                    }}
                  >
                    <MDTypography variant="body2" fontWeight="medium" mb={0.5}>
                      Camera Access Required
                    </MDTypography>
                    <MDTypography variant="caption">
                      Please allow camera access in your browser settings to use this feature. You may need to refresh the page after granting permission.
                    </MDTypography>
                  </Alert>
                ) : (
                  <>
                    {/* Webcam Preview - peut être masquée */}
                    {showVideoPreview && (
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          width: 1280,
                          height: 720,
                          facingMode: "user",
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    
                    {/* Teleprompter - Style YouTube - Positionnable */}
                    {showTeleprompter && currentScript && (
                      <MDBox
                        onMouseDown={(e) => {
                          // Ne pas activer le drag si on clique sur les boutons de navigation
                          if (e.target.closest('button')) return;
                          handleMouseDown(e);
                        }}
                        sx={{
                          position: "absolute",
                          left: `${teleprompterPositionX}%`,
                          top: `${teleprompterPositionY}%`,
                          transform: "translate(-50%, -50%)",
                          maxWidth: "90%",
                          maxHeight: showVideoPreview ? "40%" : "80%",
                          width: "auto",
                          minWidth: "60%",
                          overflow: "visible",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          zIndex: 10,
                          cursor: isDragging ? "grabbing" : "grab",
                          userSelect: "none",
                          transition: isDragging ? "none" : "all 0.1s ease",
                          pointerEvents: "auto",
                        }}
                      >
                        {/* Texte du téléprompter - Style YouTube */}
                        <MDBox
                          ref={teleprompterRef}
                          sx={{
                            width: "100%",
                            bgcolor: "rgba(0, 0, 0, 0.75)",
                            p: showVideoPreview ? 3 : 4,
                            pb: isFullscreen && sections.length > 1 ? 10 : (showVideoPreview ? 3 : 4),
                            borderRadius: showVideoPreview ? 2 : 0,
                            position: "relative",
                            overflow: "visible",
                            minHeight: isFullscreen ? 250 : "auto",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <MDBox
                            sx={{
                              width: "100%",
                              maxHeight: isFullscreen ? "60vh" : "400px",
                              overflowY: "auto",
                              overflowX: "hidden",
                              "&::-webkit-scrollbar": {
                                width: "4px",
                              },
                              "&::-webkit-scrollbar-track": {
                                background: "rgba(255, 255, 255, 0.1)",
                                borderRadius: "2px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                background: "rgba(255, 255, 255, 0.3)",
                                borderRadius: "2px",
                              },
                            }}
                          >
                            <MDTypography
                              variant="h5"
                              sx={{
                                color: "#ffffff !important",
                                textAlign: "center",
                                lineHeight: 1.8,
                                fontSize: showVideoPreview 
                                  ? { xs: "1.3rem", md: "1.6rem" }
                                  : { xs: "1.5rem", md: "1.9rem" },
                                transform: isFullscreen ? "none" : `translateY(-${teleprompterScroll}px)`,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)",
                                letterSpacing: "0.2px",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                                fontWeight: 400,
                                px: 1,
                              }}
                            >
                              {isFullscreen && currentSection
                                ? currentSection.content
                                : currentScript.full || currentScript.sections.map(s => s.content).join("\n\n")}
                            </MDTypography>
                          </MDBox>
                          
                          {/* Navigation en plein écran - Positionnée en bas */}
                          {isFullscreen && sections.length > 1 && (
                            <MDBox
                              sx={{
                                position: "absolute",
                                bottom: 20,
                                left: "50%",
                                transform: "translateX(-50%)",
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                                zIndex: 10000,
                                pointerEvents: "auto",
                              }}
                            >
                              <MDButton
                                variant="contained"
                                size="medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handlePrevSection();
                                }}
                                disabled={!hasPrevSection}
                                sx={{
                                  minWidth: 50,
                                  width: 50,
                                  height: 50,
                                  borderRadius: "50%",
                                  bgcolor: hasPrevSection ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)",
                                  backdropFilter: "blur(10px)",
                                  border: hasPrevSection ? "2px solid rgba(255, 255, 255, 0.5)" : "2px solid rgba(255, 255, 255, 0.2)",
                                  pointerEvents: "auto",
                                  "&:hover": {
                                    bgcolor: hasPrevSection ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.1)",
                                    transform: "scale(1.1)",
                                  },
                                  "&:disabled": {
                                    opacity: 0.3,
                                    border: "2px solid rgba(255, 255, 255, 0.1)",
                                  },
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <Icon sx={{ color: "#fff", fontSize: 28 }}>chevron_left</Icon>
                              </MDButton>
                              
                              <MDBox
                                sx={{
                                  px: 2.5,
                                  py: 1,
                                  borderRadius: 3,
                                  bgcolor: "rgba(0, 0, 0, 0.7)",
                                  backdropFilter: "blur(10px)",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                  pointerEvents: "none",
                                }}
                              >
                                <MDTypography
                                  variant="body2"
                                  sx={{
                                    color: "#fff",
                                    fontWeight: "medium",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {currentSection?.name || "Section"} {currentSectionIndex + 1}/{sections.length}
                                </MDTypography>
                              </MDBox>
                              
                              <MDButton
                                variant="contained"
                                size="medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleNextSection();
                                }}
                                disabled={!hasNextSection}
                                sx={{
                                  minWidth: 50,
                                  width: 50,
                                  height: 50,
                                  borderRadius: "50%",
                                  bgcolor: hasNextSection ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)",
                                  backdropFilter: "blur(10px)",
                                  border: hasNextSection ? "2px solid rgba(255, 255, 255, 0.5)" : "2px solid rgba(255, 255, 255, 0.2)",
                                  pointerEvents: "auto",
                                  "&:hover": {
                                    bgcolor: hasNextSection ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.1)",
                                    transform: "scale(1.1)",
                                  },
                                  "&:disabled": {
                                    opacity: 0.3,
                                    border: "2px solid rgba(255, 255, 255, 0.1)",
                                  },
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <Icon sx={{ color: "#fff", fontSize: 28 }}>chevron_right</Icon>
                              </MDButton>
                            </MDBox>
                          )}
                        </MDBox>
                      </MDBox>
                    )}
                    
                    {/* Fond noir si vidéo masquée */}
                    {!showVideoPreview && !showTeleprompter && (
                      <MDBox
                        sx={{
                          width: "100%",
                          height: "100%",
                          bgcolor: "#000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MDTypography variant="body2" color="#fff">
                          Camera active - Enable teleprompter to see script
                        </MDTypography>
                      </MDBox>
                    )}
                  </>
                )}
              </MDBox>

              {/* Teleprompter Controls */}
              {currentScript && (
                <MDBox
                  sx={{
                    bgcolor: "#fafafa",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                  }}
                >
                  {/* Toggle Video Preview */}
                  <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <Icon sx={{ color: showVideoPreview ? "#0EB1EC" : "#9e9e9e" }}>
                        {showVideoPreview ? "videocam" : "videocam_off"}
                      </Icon>
                      <MDTypography variant="body2" fontWeight="medium">
                        Show Video Preview
                      </MDTypography>
                    </MDBox>
                    <MDButton
                      variant={showVideoPreview ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setShowVideoPreview(!showVideoPreview)}
                    >
                      {showVideoPreview ? "Hide" : "Show"}
                    </MDButton>
                  </MDBox>

                  {/* Toggle Teleprompter */}
                  <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <Icon sx={{ color: showTeleprompter ? "#0EB1EC" : "#9e9e9e" }}>
                        {showTeleprompter ? "text_fields" : "text_fields_off"}
                      </Icon>
                      <MDTypography variant="body2" fontWeight="medium">
                        Show Teleprompter
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" gap={1}>
                      <MDButton
                        variant={isFullscreen ? "contained" : "outlined"}
                        size="small"
                        startIcon={<Icon>{isFullscreen ? "fullscreen_exit" : "fullscreen"}</Icon>}
                        onClick={() => {
                          const newFullscreen = !isFullscreen;
                          setIsFullscreen(newFullscreen);
                          if (newFullscreen) {
                            // Afficher la vidéo en plein écran
                            setShowVideoPreview(true);
                            // Demander le plein écran pour la zone vidéo
                            const videoContainer = document.querySelector('[data-video-container]');
                            const element = videoContainer || document.documentElement;
                            if (element.requestFullscreen) {
                              element.requestFullscreen();
                            } else if (element.webkitRequestFullscreen) {
                              element.webkitRequestFullscreen();
                            } else if (element.msRequestFullscreen) {
                              element.msRequestFullscreen();
                            }
                          } else {
                            // Sortir du plein écran
                            if (document.exitFullscreen) {
                              document.exitFullscreen();
                            } else if (document.webkitExitFullscreen) {
                              document.webkitExitFullscreen();
                            } else if (document.msExitFullscreen) {
                              document.msExitFullscreen();
                            }
                          }
                        }}
                      >
                        {isFullscreen ? "Exit Fullscreen" : "Fullscreen Camera"}
                      </MDButton>
                      <MDButton
                        variant={showTeleprompter ? "contained" : "outlined"}
                        size="small"
                        onClick={() => {
                          const newState = !showTeleprompter;
                          setShowTeleprompter(newState);
                          if (newState) {
                            setTeleprompterScroll(0);
                            setCurrentSectionIndex(0); // Reset à la première section
                          }
                        }}
                      >
                        {showTeleprompter ? "Hide" : "Show"} Teleprompter
                      </MDButton>
                    </MDBox>
                  </MDBox>

                  {/* Info sur le mode */}
                  {showTeleprompter && !showVideoPreview && (
                    <Alert severity="info" icon={<Icon>info</Icon>} sx={{ mb: 2 }}>
                      <MDTypography variant="caption">
                        <strong>Professional Mode:</strong> Video preview is hidden. Focus on reading the script naturally while looking at the camera.
                      </MDTypography>
                    </Alert>
                  )}
                  
                  {isFullscreen && (
                    <Alert severity="success" icon={<Icon>fullscreen</Icon>} sx={{ mb: 2 }}>
                      <MDTypography variant="caption">
                        <strong>Fullscreen Mode:</strong> Camera is in fullscreen. Press ESC or click &quot;Exit Fullscreen&quot; to exit.
                      </MDTypography>
                    </Alert>
                  )}

                  {showTeleprompter && (
                    <>
                      {/* Speed Control */}
                      <MDBox mb={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <MDTypography variant="caption" fontWeight="medium">
                            Scroll Speed
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            {teleprompterSpeed}%
                          </MDTypography>
                        </MDBox>
                        <Box
                          component="input"
                          type="range"
                          min="0"
                          max="100"
                          value={teleprompterSpeed}
                          onChange={(e) => setTeleprompterSpeed(Number(e.target.value))}
                          sx={{
                            width: "100%",
                            height: 6,
                            borderRadius: 3,
                            background: "#e0e0e0",
                            outline: "none",
                            "&::-webkit-slider-thumb": {
                              appearance: "none",
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                            //   background: "#0EB1EC",
                              cursor: "pointer",
                            },
                            "&::-moz-range-thumb": {
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: "#0EB1EC",
                              cursor: "pointer",
                              border: "none",
                            },
                          }}
                        />
                      </MDBox>

                      {/* Position Controls */}
                      <MDBox mb={2}>
                        <MDTypography variant="caption" fontWeight="medium" mb={2} display="block">
                          Position (Drag the teleprompter or use sliders)
                        </MDTypography>
                        
                        {/* Horizontal Position */}
                        <MDBox mb={2}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <MDTypography variant="caption" fontWeight="medium">
                              Horizontal Position
                            </MDTypography>
                            <MDTypography variant="caption" color="text">
                              {teleprompterPositionX}%
                            </MDTypography>
                          </MDBox>
                          <Box
                            component="input"
                            type="range"
                            min="10"
                            max="90"
                            value={teleprompterPositionX}
                            onChange={(e) => setTeleprompterPositionX(Number(e.target.value))}
                            sx={{
                              width: "100%",
                              height: 6,
                              borderRadius: 3,
                              background: "#e0e0e0",
                              outline: "none",
                              "&::-webkit-slider-thumb": {
                                appearance: "none",
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: "#0EB1EC",
                                cursor: "pointer",
                              },
                              "&::-moz-range-thumb": {
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: "#0EB1EC",
                                cursor: "pointer",
                                border: "none",
                              },
                            }}
                          />
                        </MDBox>

                        {/* Vertical Position */}
                        <MDBox mb={2}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <MDTypography variant="caption" fontWeight="medium">
                              Vertical Position
                            </MDTypography>
                            <MDTypography variant="caption" color="text">
                              {teleprompterPositionY}%
                            </MDTypography>
                          </MDBox>
                          <Box
                            component="input"
                            type="range"
                            min="10"
                            max="90"
                            value={teleprompterPositionY}
                            onChange={(e) => setTeleprompterPositionY(Number(e.target.value))}
                            sx={{
                              width: "100%",
                              height: 6,
                              borderRadius: 3,
                              background: "#e0e0e0",
                              outline: "none",
                              "&::-webkit-slider-thumb": {
                                appearance: "none",
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: "#0EB1EC",
                                cursor: "pointer",
                              },
                              "&::-moz-range-thumb": {
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: "#0EB1EC",
                                cursor: "pointer",
                                border: "none",
                              },
                            }}
                          />
                        </MDBox>

                        {/* Preset Positions */}
                        <MDBox display="flex" gap={1} flexWrap="wrap">
                          <MDButton
                            variant="outlined"
                            size="small"

                            onClick={() => {
                              setTeleprompterPositionX(50);
                              setTeleprompterPositionY(85);
                            }}
                          >
                            Bottom Center
                          </MDButton>
                          <MDButton
                            variant="outlined"
                            size="small"

                            onClick={() => {
                              setTeleprompterPositionX(50);
                              setTeleprompterPositionY(50);
                            }}
                          >
                            Center
                          </MDButton>
                          <MDButton
                            variant="outlined"
                            size="small"

                            onClick={() => {
                              setTeleprompterPositionX(50);
                              setTeleprompterPositionY(30);
                            }}
                          >
                            Top Center
                          </MDButton>
                          <MDButton
                            variant="outlined"
                            size="small"

                            onClick={() => {
                              setTeleprompterPositionX(50);
                              setTeleprompterPositionY(65);
                            }}
                          >
                            Natural Reading
                          </MDButton>
                        </MDBox>
                      </MDBox>

                      {/* Manual Scroll Controls */}
                      <MDBox display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                        <MDButton
                          variant="outlined"
                          size="small"
                          startIcon={<Icon>keyboard_arrow_up</Icon>}
                          onClick={() => setTeleprompterScroll((prev) => Math.max(0, prev - 100))}
                        >
                          Scroll Up
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          size="small"
                          startIcon={<Icon>keyboard_arrow_down</Icon>}
                          onClick={() => {
                            setTeleprompterScroll((prev) => {
                              const maxScroll = teleprompterRef.current?.scrollHeight || 10000;
                              return Math.min(prev + 100, maxScroll);
                            });
                          }}
                        >
                          Scroll Down
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          size="small"
                          startIcon={<Icon>refresh</Icon>}
                          onClick={() => {
                            setTeleprompterScroll(0);
                            if (isRecording) {
                              // Si on reset pendant l'enregistrement, on peut continuer
                            }
                          }}
                        >
                          Reset
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          size="small"
                          startIcon={<Icon>{isRecording ? "pause" : "play_arrow"}</Icon>}
                          onClick={() => {
                            if (isRecording) {
                              // Pause le défilement automatique en mettant la vitesse à 0 temporairement
                              setTeleprompterSpeed(0);
                            }
                          }}
                          disabled={!isRecording}
                        >
                          {teleprompterSpeed === 0 && isRecording ? "Resume" : "Pause"}
                        </MDButton>
                      </MDBox>
                      
                      {/* Info sur le défilement */}
                      {isRecording && showTeleprompter && (
                        <MDBox mt={2} textAlign="center">
                          <MDTypography variant="caption" color="text">
                            {teleprompterSpeed > 0 ? (
                              <>Auto-scrolling at {teleprompterSpeed}% speed</>
                            ) : (
                              <>Auto-scroll paused - use manual controls</>
                            )}
                          </MDTypography>
                        </MDBox>
                      )}
                    </>
                  )}
                </MDBox>
              )}

              {/* Recording Status Checks */}
              <MDBox
                sx={{
                  bgcolor: "#fafafa",
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                }}
              >
                <MDBox display="flex" flexWrap="wrap" gap={2} mb={2}>
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <Icon
                      sx={{
                        color: recordingChecks.position ? "#4caf50" : "#ff9800",
                        fontSize: 20,
                      }}
                    >
                      {recordingChecks.position ? "check_circle" : "warning"}
                    </Icon>
                    <MDTypography variant="body2" fontWeight="medium">
                      Position
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <Icon
                      sx={{
                        color: recordingChecks.lighting ? "#4caf50" : "#ff9800",
                        fontSize: 20,
                      }}
                    >
                      {recordingChecks.lighting ? "check_circle" : "warning"}
                    </Icon>
                    <MDTypography variant="body2" fontWeight="medium">
                      Lighting
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <Icon
                      sx={{
                        color: recordingChecks.audio ? "#4caf50" : "#ff9800",
                        fontSize: 20,
                      }}
                    >
                      {recordingChecks.audio ? "check_circle" : "warning"}
                    </Icon>
                    <MDTypography variant="body2" fontWeight="medium">
                      Audio
                    </MDTypography>
                  </MDBox>
                </MDBox>

                {/* Record Button */}
                {!recordedVideo ? (
                  <MDBox display="flex" justifyContent="center">
                    {!isRecording ? (
                      <MDButton
                        variant="contained"
                        size="large"
                        onClick={handleStartRecording}
                        disabled={cameraPermission === "denied" || !deviceStatus.camera}
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          minWidth: 120,
                          bgcolor: "#0EB1EC",
                          "&:hover": {
                            bgcolor: "#0C9DD4",
                          },
                        }}
                      >
                        <MDBox
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            bgcolor: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon sx={{ color: "#0EB1EC", fontSize: 40 }}>
                            fiber_manual_record
                          </Icon>
                        </MDBox>
                      </MDButton>
                    ) : (
                      <MDButton
                        variant="contained"
                        color="error"
                        size="large"
                        onClick={handleStopRecording}
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          minWidth: 120,
                        }}
                      >
                        <MDBox
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            bgcolor: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon sx={{ color: "#f44336", fontSize: 40 }}>stop</Icon>
                        </MDBox>
                      </MDButton>
                    )}
                  </MDBox>
                ) : (
                  <MDBox textAlign="center">
                    <MDBox
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        p: 2,
                        bgcolor: "#f5f5f5",
                        mb: 2,
                      }}
                    >
                      <MDBox display="flex" alignItems="center" justifyContent="center" gap={2}>
                        <Icon color="success">check_circle</Icon>
                        <MDTypography variant="body2" fontWeight="medium">
                          Master video recorded: {recordedVideo.name}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                    <MDButton
                      variant="outlined"
                      startIcon={<Icon>refresh</Icon>}
                      onClick={() => {
                        setRecordedVideo(null);
                        setFieldValue("masterVideo", null);
                        setRecordingChecks((prev) => ({ ...prev, audio: false }));
                      }}
                    >
                      Record Again
                    </MDButton>
                  </MDBox>
                )}
              </MDBox>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Teleprompter */}
        <Grid item xs={12} md={5}>
          <Card sx={{ border: "1px solid #e0e0e0", borderRadius: 2, height: "100%" }}>
            <CardContent>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Teleprompter
                </MDTypography>
                <MDButton
                  variant="outlined"
                  size="small"
                  startIcon={<Icon>auto_awesome</Icon>}
                  onClick={improveScriptWithAI}
                  disabled={isGeneratingScript || !values.videoStructureData}
                >
                  {isGeneratingScript ? "Generating..." : "Improve with AI"}
                </MDButton>
              </MDBox>
              
              <MDTypography variant="body2" color="text" mb={2}>
                Script for:{" "}
                {structureName.split(" → ").map((part, index, array) => (
                  <span key={index}>
                    <MDTypography
                      component="span"
                      variant="body2"
                      fontWeight="medium"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleSectionClick(part)}
                    >
                      {part}
                    </MDTypography>
                    {index < array.length - 1 && " → "}
                  </span>
                ))}
              </MDTypography>

              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                  maxHeight: 600,
                  overflow: "auto",
                }}
              >
                {currentScript.sections.length > 0 ? (
                  currentScript.sections.map((section, index) => (
                    <MDBox key={index} mb={3}>
                      <MDTypography
                        variant="h6"
                        fontWeight="medium"
                        mb={1}
                      >
                        {section.name}:
                      </MDTypography>
                      <MDTypography
                        variant="body2"
                        color="text"
                        sx={{
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.8,
                          fontSize: "1rem",
                        }}
                      >
                        {section.content}
                      </MDTypography>
                    </MDBox>
                  ))
                ) : (
                  <MDTypography variant="body2" color="text">
                    {currentScript.full}
                  </MDTypography>
                )}
              </Paper>

              {/* Script Info */}
              <MDBox mt={2}>
                <MDTypography variant="caption" color="text" display="block" mb={1}>
                  <strong>Placeholders:</strong> {`{prénom}`}, {`{company}`}, {`{info_contexte}`}, {`{context_fact}`}, {`{nom_expéditeur}`} will be automatically replaced for each contact.
                </MDTypography>
                {scriptHistory.length > 1 && (
                  <MDButton
                    variant="text"
                    size="small"
                    startIcon={<Icon>history</Icon>}
                    onClick={() => {
                      // Revenir à la version précédente
                      if (scriptHistory.length > 1) {
                        const previousScript = scriptHistory[scriptHistory.length - 2];
                        setScript(previousScript);
                        setScriptHistory(scriptHistory.slice(0, -1));
                      }
                    }}
                  >
                    Undo AI Improvement
                  </MDButton>
                )}
              </MDBox>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Info Alert */}
      <Alert severity="info" icon={<Icon>info</Icon>} sx={{ mt: 3 }}>
        <MDTypography variant="body2">
          <strong>How it works:</strong> Record this video once. Our AI will use lip-sync technology to make you say personalized content for each contact automatically.
        </MDTypography>
      </Alert>
    </MDBox>
  );
}

// typechecking props for RecordTab
RecordTab.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default RecordTab;
