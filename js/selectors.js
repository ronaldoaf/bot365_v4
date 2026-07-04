//Seletores CSS centralizados da interface da Bet365.
//Quando o site mudar o markup, ajuste apenas este arquivo.
const SEL = {
   // Lista de jogos (Inplay / Match Goals)
   competitionList:    '.ovm-CompetitionList',
   fixture:            '.ovm-Fixture',
   teamName:           '.ovm-FixtureDetailsTwoWay_TeamName',
   teamsWrapper:       '.ovm-FixtureDetailsTwoWay_TeamsWrapper',
   timer:              '.ovm-FixtureDetailsTwoWay_Timer, .ovm-InPlayTimer',
   suspended:          '.ovm-ParticipantStackedCentered_Suspended',
   handicap:           '.ovm-ParticipantHandicap_Handicap',
   odds:               '.ovm-ParticipantHandicap_Odds',
   marketSwitcherItem: '.ovm-ClassificationMarketSwitcherMenu_Item',

   // Tela do evento (event view) - abas e mercados goalline (Asian Lines)
   gridHeaderMarketTabs: '.ipe-GridHeaderMarketTabs',
   pitchViewButton:      'div[data-mbl-variant="ML1"]',
   gridHeaderTabLink:    '.ipe-GridHeaderTabLink div',
   eventNavRightArrow:   '.ipe-EventViewNavBar_RightArrow',
   marketGroupPod:       '.gl-MarketGroupPod',
   participantLabel:     '.srb-ParticipantLabelCentered',
   participantOddsOnly:  '.gl-ParticipantOddsOnly',
   oddsDropdownLabel:    '.bsc-OddsDropdownLabel',

   // Cupom de aposta (bet slip)
   stakeBox:              '.bsf-StakeBox',
   stakeInput:            '.bsf-StakeBox_StakeInput',
   acceptButton:          '.bsf-AcceptButton',
   placeBetButton:        '.bsf-PlaceBetButton',
   removeButton:          '.bss-RemoveButton ',
   creditsCheckbox:       '.bsc-BetCreditsHeader_CheckBox',
   receiptTick:           '.bss-ReceiptContent_Tick',
   receiptDone:           '.bss-ReceiptContent_Done',
   betFixtureDescription: '.bss-NormalBetItem_FixtureDescription',

   // Saldo / login
   balance:       'span[class*="hrm"]',
   usernameInput: '[placeholder*="Username"]',
   passwordInput: '[placeholder="Password"]',
   loginSubmit:   'button[class*="slm2-"] > span',
   lastLogin:     '[class*="llr"]',

   // Popups
   cookieAccept: '.ccm-CookieConsentPopup_Accept',
   freeBetClose: '.pm-FreeBetsPushGraphicCloseButton',
};

//Nomes de classe usados em verificações de estado (classList.contains / hasClass)
const CLS = {
   creditsCheckboxSelected:  'bsc-BetCreditsHeader_CheckBox-selected',
   marketSwitcherItemActive: 'ovm-ClassificationMarketSwitcherMenu_Item-active',
   gridHeaderTabLinkSelected: 'ipe-GridHeaderTabLink-selected',
   hidden:                   'Hidden',
};
