/* ============================================================
   TALENTSCAN — script.js
   Job Eligibility & Salary Estimator
   Vanilla JS | No frameworks | Fundamentals only
   ============================================================ */

"use strict";

/* ============================================================
   SECTION 1 — STATE
   We store all candidate data in an array of objects.
   MAX_CANDIDATES controls the loop limit.
   ============================================================ */

const MAX_CANDIDATES = 3;         // Loop limit: analyse 3 candidates
const candidatesArray = [];        // Array of candidate objects

/* ============================================================
   SECTION 2 — DOM REFERENCES
   Grab all elements we need once; reuse throughout.
   ============================================================ */

const form           = document.getElementById("candidateForm");
const submitBtn      = document.getElementById("submitBtn");
const resetBtn       = document.getElementById("resetBtn");

const nameInput      = document.getElementById("candidateName");
const ageInput       = document.getElementById("age");
const eduSelect      = document.getElementById("education");
const skillRange     = document.getElementById("skillScore");
const projectsInput  = document.getElementById("projects");

const scoreDisplay   = document.getElementById("scoreDisplay");
const skillBarFill   = document.getElementById("skillBarFill");

const counterText    = document.getElementById("counterText");
const dots           = [
  document.getElementById("dot0"),
  document.getElementById("dot1"),
  document.getElementById("dot2"),
];

const cardsContainer  = document.getElementById("cardsContainer");
const resultsHeader   = document.getElementById("resultsHeader");

/* Error span references */
const errors = {
  name:     document.getElementById("nameError"),
  age:      document.getElementById("ageError"),
  edu:      document.getElementById("eduError"),
  proj:     document.getElementById("projError"),
  relocate: document.getElementById("relocateError"),
};

/* ============================================================
   SECTION 3 — REAL-TIME RANGE INPUT FEEDBACK
   Updates the score badge and progress bar as slider moves.
   ============================================================ */

skillRange.addEventListener("input", function () {
  const val = parseInt(this.value);   // Get current slider value
  scoreDisplay.textContent = val;      // Show value in badge

  // Update progress bar width
  skillBarFill.style.width = val + "%";

  // Change bar colour based on score range (conditionals)
  if (val >= 86) {
    skillBarFill.style.background = "linear-gradient(90deg, #3ecf8e, #52d9a2)";
  } else if (val >= 71) {
    skillBarFill.style.background = "linear-gradient(90deg, #f5c842, #ffd96a)";
  } else if (val >= 60) {
    skillBarFill.style.background = "linear-gradient(90deg, #5c73f2, #7f94ff)";
  } else {
    skillBarFill.style.background = "linear-gradient(90deg, #f25c73, #ff8096)";
  }
});

// Initialise display on page load
skillRange.dispatchEvent(new Event("input"));

/* ============================================================
   SECTION 4 — VALIDATION FUNCTION
   Checks all fields and shows/clears error messages.
   Returns true if form is valid, false otherwise.
   ============================================================ */

function validateForm() {
  let isValid = true;   // Boolean flag

  // Clear all previous errors first (loop over error spans)
  for (const key in errors) {
    errors[key].textContent = "";
  }

  // --- Name validation ---
  const name = nameInput.value.trim();
  if (name === "") {
    errors.name.textContent = "⚠ Candidate name is required.";
    isValid = false;
  } else if (name.length < 4) {
    errors.name.textContent = "⚠ Name must be at least 2 characters.";
    isValid = false;
  }

  // --- Age validation ---
  const age = parseInt(ageInput.value);
  if (ageInput.value.trim() === "" || isNaN(age)) {
    errors.age.textContent = "⚠ Please enter a valid age.";
    isValid = false;
  } else if (age < 18 || age > 100) {
    errors.age.textContent = "⚠ Age must be between 1 and 100.";
    isValid = false;
  }

  // --- Education validation ---
  if (eduSelect.value === "") {
    errors.edu.textContent = "⚠ Please select an education level.";
    isValid = false;
  }

  // --- Projects validation ---
  const projects = parseInt(projectsInput.value);
  if (projectsInput.value.trim() === "" || isNaN(projects)) {
    errors.proj.textContent = "⚠ Please enter number of projects.";
    isValid = false;
  } else if (projects < 0 || projects > 50) {
    errors.proj.textContent = "⚠ Projects must be between 0 and 50.";
    isValid = false;
  }

  // --- Relocate validation ---
  const relocateVal = document.querySelector('input[name="relocate"]:checked');
  if (!relocateVal) {
    errors.relocate.textContent = "⚠ Please select relocation preference.";
    isValid = false;
  }

  return isValid;    // Return validation result
}

/* ============================================================
   SECTION 5 — CORE LOGIC FUNCTIONS
   All logic is modular and clearly separated.
   ============================================================ */

/*
 * checkEligibility(candidate)
 * Returns: "priority" | "eligible" | "not-eligible"
 * Uses: age, skillScore, projects from candidate object
 */
function checkEligibility(candidate) {
  const { age, skillScore, projects } = candidate;   // Destructure object

  // Not eligible conditions (check first — early exits)
  if (age < 18 || skillScore < 60 || projects < 2) {
    return "not-eligible";
  }

  // Priority candidate (most stringent check)
  if (skillScore >= 80 && projects >= 3) {
    return "priority";
  }

  // Otherwise: eligible
  return "eligible";
}

/*
 * calculateSalary(candidate)
 * Returns: object { min, max, label }
 * Uses: skillScore, relocate, education
 */
function calculateSalary(candidate) {
  const { skillScore, relocate, education, eligibility } = candidate;

  // Not eligible — no salary estimate
  if (eligibility === "not-eligible") {
    return { min: 0, max: 0, label: "N/A" };
  }

  // Base salary ranges using if-else conditionals
  let minSalary = 0;
  let maxSalary = 0;

  if (skillScore >= 86 && skillScore <= 100) {
    minSalary = 10;
    maxSalary = 18;
  } else if (skillScore >= 71 && skillScore <= 85) {
    minSalary = 6;
    maxSalary = 10;
  } else if (skillScore >= 60 && skillScore <= 70) {
    minSalary = 4;
    maxSalary = 6;
  }

  // Bonus: Willing to relocate → +1 LPA max
  if (relocate === "yes") {
    maxSalary += 1;
  }

  // Bonus: Postgraduate → +1 LPA max
  if (education === "postgraduate") {
    maxSalary += 1;
  }

  return {
    min: minSalary,
    max: maxSalary,
    label: "₹" + minSalary + " – ₹" + maxSalary + " LPA",
  };
}

/*
 * getConfidenceLevel(candidate)
 * Returns: "High" | "Medium" | "Low"
 * Based on number of projects
 */
function getConfidenceLevel(candidate) {
  const projects = candidate.projects;   // Number data type

  // Conditional chain
  if (projects >= 4) {
    return "High";
  } else if (projects >= 2) {
    return "Medium";
  } else {
    return "Low";
  }
}

/*
 * generateSuggestions(candidate)
 * Uses a loop to build an array of suggestion strings.
 * Returns: array of suggestion strings
 */
function generateSuggestions(candidate) {
  const suggestions = [];    // Empty array to collect suggestions

  // --- Build a checklist of improvement targets using an array + loop ---
  const improvementChecks = [
    {
      condition: candidate.skillScore < 60,
      message:   "Increase your JS skill score to at least 60 to become eligible.",
    },
    {
      condition: candidate.skillScore >= 60 && candidate.skillScore < 71,
      message:   "Boost your JS score past 70 to unlock the ₹6–10 LPA salary range.",
    },
    {
      condition: candidate.skillScore >= 71 && candidate.skillScore < 86,
      message:   "Score above 85 in JS to qualify for the ₹10–18 LPA salary bracket.",
    },
    {
      condition: candidate.skillScore < 80,
      message:   "Reach a JS score of 80+ to earn Priority Candidate status.",
    },
    {
      condition: candidate.projects < 2,
      message:   "Complete at least " + (2 - candidate.projects) + " more project(s) to meet the minimum eligibility requirement.",
    },
    {
      condition: candidate.projects === 2,
      message:   "Complete 1 more project to improve your confidence level from Medium to High.",
    },
    {
      condition: candidate.projects >= 2 && candidate.projects < 3,
      message:   "Complete " + (3 - candidate.projects) + " more project(s) to qualify as a Priority Candidate.",
    },
    {
      condition: candidate.age < 18,
      message:   "Candidates must be 18 or older to be eligible.",
    },
    {
      condition: candidate.relocate === "no",
      message:   "Consider relocation flexibility — it adds ₹1 LPA to the max salary estimate.",
    },
    {
      condition: candidate.education !== "postgraduate",
      message:   "A Postgraduate qualification adds ₹1 LPA to the max salary estimate.",
    },
  ];

  // LOOP — iterate through all checks and collect applicable suggestions
  for (let i = 0; i < improvementChecks.length; i++) {
    const check = improvementChecks[i];
    if (check.condition === true) {          // Boolean check
      suggestions.push(check.message);       // Add to array
    }
  }

  return suggestions;   // Return array of strings
}

/*
 * generateReport(candidate, index)
 * Builds and returns an HTML string for one report card.
 * Uses all logic functions above.
 */
function generateReport(candidate, index) {
  const { name, age, education, skillScore, projects, relocate } = candidate;

  // Determine eligibility, salary, confidence, suggestions
  const eligibility     = candidate.eligibility;
  const salary          = calculateSalary(candidate);
  const confidence      = getConfidenceLevel(candidate);
  const suggestions     = generateSuggestions(candidate);

  /* --- Badge markup based on eligibility status --- */
  let badgeHTML = "";
  let cardClass = "";
  let barClass  = "";

  if (eligibility === "priority") {
    badgeHTML = `<span class="badge badge-priority"><span class="badge-dot"></span> Priority Candidate</span>`;
    cardClass = "priority";
    barClass  = "priority-bar";
  } else if (eligibility === "eligible") {
    badgeHTML = `<span class="badge badge-eligible"><span class="badge-dot"></span> Eligible</span>`;
    cardClass = "eligible";
    barClass  = "eligible-bar";
  } else {
    badgeHTML = `<span class="badge badge-not-eligible"><span class="badge-dot"></span> Not Eligible</span>`;
    cardClass = "not-eligible";
    barClass  = "ineligible-bar";
  }

  /* --- Confidence colour class --- */
  let confClass = "";
  if      (confidence === "High")   confClass = "high";
  else if (confidence === "Medium") confClass = "medium";
  else                              confClass = "low";

  /* --- Build education label --- */
  const eduLabels = {
    "graduate":     "Graduate",
    "postgraduate": "Postgraduate",
    "non-it":       "Non-IT",
  };
  const eduLabel = eduLabels[education] || education;

  /* --- Build suggestions list using loop --- */
  let suggestionsHTML = "";
  if (suggestions.length === 0) {
    suggestionsHTML = `<p class="no-suggestion">✓ All criteria met. Looking great!</p>`;
  } else {
    suggestionsHTML = `<ul class="suggestion-list">`;
    // LOOP — iterate through suggestions array
    for (let s = 0; s < suggestions.length; s++) {
      suggestionsHTML += `<li class="suggestion-item">${suggestions[s]}</li>`;
    }
    suggestionsHTML += `</ul>`;
  }

  /* --- Assemble full card HTML --- */
  const cardHTML = `
    <div class="report-card ${cardClass}">
      <div class="card-header">
        <div>
          <p class="card-num">CANDIDATE #${index + 1}</p>
          <h3 class="card-name">${escapeHTML(name)}</h3>
        </div>
        ${badgeHTML}
      </div>

      <div class="card-body">

        <!-- Metrics grid -->
        <div class="metrics-grid">
          <div class="metric-box">
            <p class="metric-label">Age</p>
            <p class="metric-value">${age} yrs</p>
          </div>
          <div class="metric-box">
            <p class="metric-label">Education</p>
            <p class="metric-value">${eduLabel}</p>
          </div>
          <div class="metric-box">
            <p class="metric-label">Projects</p>
            <p class="metric-value">${projects}</p>
          </div>
          <div class="metric-box">
            <p class="metric-label">Relocate</p>
            <p class="metric-value">${relocate === "yes" ? "Yes ✓" : "No ✗"}</p>
          </div>
          <div class="metric-box">
            <p class="metric-label">Salary Estimate</p>
            <p class="metric-value salary">${salary.label}</p>
          </div>
          <div class="metric-box">
            <p class="metric-label">Confidence</p>
            <p class="metric-value ${confClass}">${confidence}</p>
          </div>
        </div>

        <!-- Skill score progress bar -->
        <div class="card-skill-section">
          <div class="card-skill-label">
            <span>JS Skill Score</span>
            <span>${skillScore}/100</span>
          </div>
          <div class="card-bar-wrap">
            <div class="card-bar-fill ${barClass}" style="width: ${skillScore}%"></div>
          </div>
        </div>

        <!-- Suggestions section -->
        <div class="suggestions-section">
          <p class="suggestions-title">Improvement Suggestions</p>
          ${suggestionsHTML}
        </div>

      </div>
    </div>
  `;

  return cardHTML;
}

/* ============================================================
   SECTION 6 — HELPER: escapeHTML
   Prevent XSS by escaping user-entered strings.
   ============================================================ */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ============================================================
   SECTION 7 — UI UPDATERS
   Functions that modify the DOM.
   ============================================================ */

/* Update candidate counter badge and dots */
function updateCounter() {
  const count = candidatesArray.length;    // Get array length
  counterText.textContent = count + " / " + MAX_CANDIDATES + " candidates added";

  // LOOP — update each dot based on position vs count
  for (let i = 0; i < dots.length; i++) {
    if (i < count) {
      dots[i].classList.add("active");
    } else {
      dots[i].classList.remove("active");
    }
  }

  // Disable submit button once limit is reached
  if (count >= MAX_CANDIDATES) {
    submitBtn.disabled = true;
    submitBtn.textContent = "✓ All 3 candidates analysed";
  }
}

/* Re-render all report cards by looping through candidatesArray */
function renderAllCards() {
  cardsContainer.innerHTML = "";             // Clear container

  if (candidatesArray.length === 0) {
    resultsHeader.style.display = "none";
    return;
  }

  resultsHeader.style.display = "block";    // Show results heading

  // LOOP — iterate through the candidates array and generate each card
  for (let i = 0; i < candidatesArray.length; i++) {
    const cardHTML = generateReport(candidatesArray[i], i);
    cardsContainer.innerHTML += cardHTML;
  }

  // Scroll results into view smoothly
  setTimeout(function () {
    cardsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

/* Clear the form fields */
function clearForm() {
  nameInput.value     = "";
  ageInput.value      = "";
  eduSelect.value     = "";
  skillRange.value    = 50;
  projectsInput.value = "";

  // Clear radio selection
  const radios = document.querySelectorAll('input[name="relocate"]');
  radios.forEach(function (r) { r.checked = false; });

  // Reset range display
  skillRange.dispatchEvent(new Event("input"));

  // Clear all errors
  for (const key in errors) {
    errors[key].textContent = "";
  }
}

/* ============================================================
   SECTION 8 — FORM SUBMIT HANDLER
   The main orchestrator — runs on every form submission.
   ============================================================ */

form.addEventListener("submit", function (event) {
  event.preventDefault();    // Prevent page reload

  // 1. Validate first
  if (!validateForm()) return;

  // 2. Guard: max candidates reached
  if (candidatesArray.length >= MAX_CANDIDATES) return;

  // 3. Collect form data into a candidate object
  const candidate = {
    name:       nameInput.value.trim(),
    age:        parseInt(ageInput.value),
    education:  eduSelect.value,
    skillScore: parseInt(skillRange.value),
    projects:   parseInt(projectsInput.value),
    relocate:   document.querySelector('input[name="relocate"]:checked').value,
  };

  // 4. Determine eligibility and attach it to the object
  candidate.eligibility = checkEligibility(candidate);

  // 5. Push candidate object into the candidates array
  candidatesArray.push(candidate);

  // 6. Update counter UI
  updateCounter();

  // 7. Re-render all report cards (loop inside renderAllCards)
  renderAllCards();

  // 8. Clear form for next entry
  clearForm();
});

/* ============================================================
   SECTION 9 — RESET BUTTON HANDLER
   Clears everything: array, cards, form, counter.
   ============================================================ */

resetBtn.addEventListener("click", function () {
  // Empty the candidates array
  candidatesArray.length = 0;

  // Re-enable submit button
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<span class="btn-icon">▶</span> Analyse Candidate';

  // Clear all errors and fields
  clearForm();

  // Clear rendered cards
  cardsContainer.innerHTML = "";
  resultsHeader.style.display = "none";

  // Reset counter UI
  updateCounter();

  // Scroll back to top
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ============================================================
   SECTION 10 — PAGE INIT
   Run on first load.
   ============================================================ */
(function init() {
  updateCounter();    // Initialise counter display
  scoreDisplay.textContent = skillRange.value;
  skillBarFill.style.width = skillRange.value + "%";
})();
