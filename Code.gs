/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read from the currently open message.
 */

/**
 * The manifest key `gmail.contextualTriggers` will call this function
 * when a user opens a message.
 *
 * @param {Object} e The event object passed to the trigger function.
 * @returns {Card[]} A list of cards to display in the add-on sidebar.
 */
function onGmailMessageOpen(e) {
  // We only want to display the card if the user has a message open.
  if (!e.gmail.messageId) {
    return [];
  }

  // Build and return the initial card with the "Scan" button.
  return [buildPhishingScannerCard(e)];
}

/**
 * Builds the main card for the add-on, which includes the "Scan for Phishing" button.
 *
 * @param {Object} e The event object.
 * @returns {Card} The card to be displayed in the Gmail UI.
 */
function buildPhishingScannerCard(e) {
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('Phishing Scanner'));

  const section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph().setText('Click the button below to scan the current email for common signs of a phishing attempt.'));

  // This button, when clicked, will execute the runPhishingScan function.
  const scanButton = CardService.newTextButton()
    .setText('Scan Email for Phishing')
    .setOnClickAction(CardService.newAction().setFunctionName('runPhishingScan'));

  section.addWidget(scanButton);
  card.addSection(section);
  return card.build();
}

/**
 * Action function that is called when the "Scan Email for Phishing" button is clicked.
 * It analyzes the email content and returns a card with the results.
 *
 * @param {Object} e The event object containing information about the user's context.
 * @returns {ActionResponse} An ActionResponse that tells Gmail to update the card.
 */
function runPhishingScan(e) {
  const accessToken = e.gmail.accessToken;
  const messageId = e.gmail.messageId;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  const message = GmailApp.getMessageById(messageId);
  const subject = message.getSubject();
  const body = message.getPlainBody().toLowerCase(); // Analyze in lowercase for consistency.
  const sender = message.getFrom().toLowerCase();

  let score = 0;
  let maxScore = 0;
  let findings = [];

  // --- Basic Phishing Detection Logic ---

  // 1. Check for high-pressure or urgent keywords in the subject and body.
  maxScore += 25;
  const urgentKeywords = ['urgent', 'action required', 'immediate', 'account suspended', 'verify your account', 'security alert'];
  if (urgentKeywords.some(keyword => subject.includes(keyword) || body.includes(keyword))) {
    score += 25;
    findings.push('Detected urgent language, which is a common tactic to rush users.');
  }

  // 2. Check for generic greetings.
  maxScore += 15;
  const genericGreetings = ['dear valued customer', 'dear user', 'dear member'];
  if (genericGreetings.some(greeting => body.startsWith(greeting))) {
    score += 15;
    findings.push('Uses a generic greeting instead of your name.');
  }

  // 3. Check for requests for personal information.
  maxScore += 30;
  const sensitiveKeywords = ['password', 'social security', 'ssn', 'credit card', 'bank account'];
  if (sensitiveKeywords.some(keyword => body.includes(keyword))) {
    score += 30;
    findings.push('The email asks for sensitive personal or financial information.');
  }

  // 4. Check for suspicious links (simple check for now).
  maxScore += 15;
  if (body.includes('http://') || body.includes('https://')) {
     // A more advanced check would parse HTML and compare link text to the actual href.
     score += 15;
     findings.push('Contains links. Always hover over links before clicking to verify their destination.');
  }
  
  // 5. Check for sender that might be impersonating.
  maxScore += 15;
  const commonServices = ['microsoft', 'google', 'apple', 'amazon', 'paypal', 'netflix', 'irs'];
  if(commonServices.some(service => body.includes(service) && !sender.includes(service))) {
      score += 15;
      findings.push(`The email mentions ${commonServices.find(s => body.includes(s))} but the sender (${sender}) does not seem to be from an official domain.`);
  }


  const confidenceScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  // Build the results card.
  const resultCard = buildResultsCard(confidenceScore, findings);
  
  // Return an ActionResponse to navigate to the new card.
  const navigation = CardService.newNavigation().updateCard(resultCard);
  return CardService.newActionResponseBuilder().setNavigation(navigation).build();
}


/**
 * Builds the card that displays the phishing scan results.
 *
 * @param {number} score The calculated phishing confidence score (0-100).
 * @param {string[]} findings An array of strings describing the findings.
 * @returns {Card} The results card.
 */
function buildResultsCard(score, findings) {
  let headerTitle;
  let riskLevel;

  if (score > 70) {
    headerTitle = 'High Phishing Risk';
    riskLevel = 'This email has a high probability of being a phishing attempt. Be extremely cautious.';
  } else if (score > 40) {
    headerTitle = 'Medium Phishing Risk';
    riskLevel = 'This email shows some signs of phishing. Please proceed with caution.';
  } else {
    headerTitle = 'Low Phishing Risk';
    riskLevel = 'This email appears to be safe, but always remain vigilant.';
  }

  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle(headerTitle));
  
  const section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph().setText(`<b>Confidence Score: ${score}%</b>`));
  section.addWidget(CardService.newTextParagraph().setText(riskLevel));

  if (findings.length > 0) {
      const findingsList = findings.map(finding => `• ${finding}`).join('<br>');
      section.addWidget(CardService.newTextParagraph().setText(`<b>Findings:</b><br>${findingsList}`));
  } else {
      section.addWidget(CardService.newTextParagraph().setText('No specific phishing indicators were found based on our simple scan.'));
  }
  
  // Add a button to go back and rescan.
  section.addWidget(CardService.newTextButton()
    .setText("Scan Another Email")
    .setOnClickAction(CardService.newAction().setFunctionName("onGmailMessageOpen")));


  card.addSection(section);
  return card.build();
}
