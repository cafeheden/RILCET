import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import Dropdown from "../components/Home/DropDown";
import InputField from "../components/Home/InputField";
import Button1 from "../components/Home/Button1";
import ResultDisplay from "../components/Home/EvaluationResult";
import RefreshButton from "../components/Home/RefreshButton";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // Ensure axios is installed

const Home = () => {
  const [lValue, setLValue] = useState(""); // State for L value
  const [aValue, setAValue] = useState(""); // State for a value
  const [bValue, setBValue] = useState(""); // State for b value
  const [result, setResult] = useState(null); // State for evaluation result
  const [selectedStage, setSelectedStage] = useState(""); // State for selected treatment stage
  const [treatmentStageRanges, setTreatmentStageRanges] = useState({}); // Store fetched ranges

  const circle1 = useRef(null);
  const circle2 = useRef(null);
  const circle3 = useRef(null);

  // Animation for the background circles
  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(circle1.current, {
      duration: 6,
      borderRadius: [
        "40% 60% 60% 40% / 40% 60% 40% 60%",
        "60% 40% 30% 70% / 70% 30% 60% 40%",
        "50% 50% 50% 50% / 50% 50% 50% 50%",
      ],
      scale: [1, 1.2, 1.1],
      ease: "easeInOut",
    })
      .to(circle2.current, {
        duration: 7,
        borderRadius: [
          "40% 60% 60% 40% / 40% 60% 40% 60%",
          "70% 30% 50% 50% / 30% 70% 50% 50%",
          "50% 50% 50% 50% / 50% 50% 50% 50%",
        ],
        scale: [1, 1.15, 0.9],
        ease: "easeInOut",
      })
      .to(circle3.current, {
        duration: 5,
        borderRadius: [
          "30% 70% 50% 50% / 50% 50% 30% 70%",
          "60% 40% 40% 60% / 60% 40% 40% 60%",
          "50% 50% 50% 50% / 50% 50% 50% 50%",
        ],
        scale: [1, 1.1, 1.05],
        ease: "easeInOut",
      });
  }, []);

  // Fetch treatment stage ranges from the API
  useEffect(() => {
    const fetchTreatmentStageRanges = async () => {
      try {
        const response = await axios.get("https://rilcet.onrender.com/treatment-stages"); // Replace with your API endpoint
        setTreatmentStageRanges(response.data); // Assuming response data is in the correct format
      } catch (error) {
        toast.error("Failed to fetch treatment stage ranges.");
      }
    };

    fetchTreatmentStageRanges();
  }, []);

  // Handle the evaluate button click
  const handleEvaluateClick = async () => {
    const lValueNum = parseFloat(lValue);
    const aValueNum = parseFloat(aValue);
    const bValueNum = parseFloat(bValue);
    const currentTime = new Date().toDateString();

    const searchStage = treatmentStageRanges.find(
      (stage) => stage.treatmentStage === selectedStage
    );

    if (!searchStage) {
      toast.warn("Please select a valid treatment stage before evaluating.");
      return; // Exit if no matching stage is found
    }

    // Validate LAB values
    if (
      isNaN(lValueNum) || isNaN(aValueNum) || isNaN(bValueNum) ||
      lValueNum < 0 || lValueNum > 100 ||
      aValueNum < -128 || aValueNum > 127 ||
      bValueNum < -128 || bValueNum > 127
    ) {
      toast.warn("Warning: The LAB values are outside the valid range! Please re-enter the values.");
      return;
    } else {

      // Logic for range calc
      let tolerance95 = 0;
      let tolerance99 = 0;

      // Check L value in 95% and 99%
      if(lValueNum >= searchStage.ranges["95%"].L[0] && lValueNum <= searchStage.ranges["95%"].L[1]) {
        tolerance95++;
      }
      if (lValueNum >= searchStage.ranges["99%"].L[0] && lValueNum <= searchStage.ranges["99%"].L[1]) {
        tolerance99++;
      }

      // Check A value in 95% and 99%
      if (aValueNum >= searchStage.ranges["95%"].A[0] && aValueNum <= searchStage.ranges["95%"].A[1]) {
        tolerance95++;
      }
      if (aValueNum >= searchStage.ranges["99%"].A[0] && aValueNum <= searchStage.ranges["99%"].A[1]) {
        tolerance99++;
      }

      // Check B value in 95% and 99%
      if (bValueNum >= searchStage.ranges["95%"].B[0] && bValueNum <= searchStage.ranges["95%"].B[1]) {
        tolerance95++;
      }
      if (bValueNum >= searchStage.ranges["99%"].B[0] && bValueNum <= searchStage.ranges["99%"].B[1]) {
        tolerance99++;
      }

      // Step 4: Evaluate the result based on the matches
      if (tolerance95 === 3 && tolerance99 === 3) {
        setResult('normal');
      } else if (tolerance95 >= 2 && tolerance99 < 3) {
        setResult('normal');
      } else if (tolerance99 >= 2 && tolerance95 < 3) {
        setResult('borderline')
      } else {
        setResult("outOfRange");
      }

      // Preparing the data to be sent to the database
      const evaluationData = {
        treatmentStage: selectedStage,
        L: lValueNum,
        A: aValueNum,
        B: bValueNum,
        result: result,
        time: currentTime
      };

      // Make the API request to save the data
      try {
        const response = await axios.post('https://rilcet.onrender.com/evaluation', evaluationData);
        if(response.status === 200) {
          console.log("Data saved success");
        }
      } catch (error) {
        console.log("Error saving data : ", error);
      }
    }
  };


  return (
    <div className="relative w-full h-full bg-primaryColor overflow-hidden">
      {/* Random animated blurred morphing circles */}
      <div
        ref={circle1}
        className="absolute bg-red-700/30 blur-3xl w-80 h-80 -right-24 -top-24"
      ></div>
      <div
        ref={circle2}
        className="absolute bg-blue-700/30 blur-3xl w-80 h-80 top-1/3 -left-24"
      ></div>
      <div
        ref={circle3}
        className="absolute bg-orange-600/40 blur-3xl w-80 h-80 -bottom-24 -right-24"
      ></div>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center justify-center font-lora text-tertiaryColor font-medium my-16 sm:my-24 mx-10 sm:mx-40">
        <div className="LAB-Form border-2 rounded-[32px] p-16 shadow-lg mb-16 sm:mb-24">
          <h1 className="header font-semibold text-2xl text-center sm:text-nowrap sm:text-4xl mb-16">
            Lab Color Evaluation Tool
          </h1>

          {/* Treatment Stage */}
          <div className="treatment-stage">
            <h1 className="ts-header text-xl">Treatment Stage</h1>
            <h2 className="ts-sub-header text-base font-light">
              Please select the treatment stage from below options
            </h2>
            <Dropdown onSelectStage={setSelectedStage} />{" "}
            {/* Pass setSelectedStage as a prop */}
          </div>

          {/* Lab Color Values */}
          <div className="lab-color-values my-16">
            <h1 className="ts-header text-xl">Lab Color Values</h1>
            <h2 className="ts-sub-header text-base font-light">
              Please enter the respective values in the correct field.
            </h2>

            {/* L Value */}
            <div className="L-value mt-5">
              <h1 className="text-tertiaryColor text-base font-normal">
                L (<span className="italic">Lightness</span>) Value
              </h1>
              <InputField
                value={lValue}
                onChange={setLValue}
                placeholder="Enter the value here..."
              />
            </div>

            {/* A Value */}
            <div className="A-value mt-5">
              <h1 className="text-tertiaryColor text-base font-normal">
                a (<span className="italic">Green to Red</span>) Value
              </h1>
              <InputField
                value={aValue}
                onChange={setAValue}
                placeholder="Enter the value here..."
              />
            </div>

            {/* B Value */}
            <div className="B-value mt-5">
              <h1 className="text-tertiaryColor text-base font-normal">
                b (<span className="italic">Blue to Yellow</span>) Value
              </h1>
              <InputField
                value={bValue}
                onChange={setBValue}
                placeholder="Enter the value here..."
              />
            </div>
          </div>

          {/* Evaluate Button */}
          <div className="evaluate-button flex justify-center">
            <Button1 text="Evaluate" onClick={handleEvaluateClick} />
          </div>

          {/* Result Display */}
          {result && <ResultDisplay result={result} />}
        </div>
      </div>
    </div>
  );
};

export default Home;
