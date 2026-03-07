# Technical Specification: Linguistic Monolith (v. 2.0)

1. Philosophy and Interface Aesthetics
   • Visual Canon: Strict binarism. Only Black (#000000) and White (#FFFFFF). Complete absence of gradients, shadows, and decorative frames.
   • Typography: Classical Antiqua (serif). Font size is fixed; line wrapping is adaptive (word-wrap).
   • Interactivity: Full blocking of standard browser gestures (-webkit-touch-callout: none, user-select: none). Interaction occurs only through onTap.
   • Central Arbiter: A circular button located at the geometric center of the screen. Its diameter corresponds to the height of a mobile keyboard key.

2. System State Registry (State Map)
   • State 0 (Gateway): The screen is vertically divided into two input fields (textarea). In the center — the “SYNC” button. Text remains inert until the button is pressed.
   • State 1 (Reading): Level 0. Vertical split 50vw | 50vw. The button changes its label to “GATE”. Tapping a word initiates transition to State 2.
   • State 2 (Analysis): Level 1. Three vertical columns of 33.3vw each. The central column is horizontally divided: Light top (Interpretation A) / Dark bottom (Interpretation B) at 50vh. The button changes its label to “CLOSE”.
   • State 3 (Final Fractal): Level 2. Tapping a word in the upper or lower row of Stage 2 divides the central column into three horizontal rows of 33.3vh each. The middle row is vertically divided: Light field (Interpretation A) | Dark field (Interpretation B). The button changes its label to “RESET”.
   Interpretation (at any level): etymology and examples.

3. Algorithmic Logic
   • Tokenization: Upon input, the text is split into <span> elements with unique data-id. Punctuation marks are separated from the word body, preserving their position but not being part of the link.

Active Pair Inversion
• Mechanism: When a word is tapped, only the selected word and its direct counterpart in the opposite panel are inverted.
• Visual Marker: In the light panel, the word becomes a black block with white text. In the dark panel, the corresponding word becomes a white block with black text.
• Locality: The inversion applies only to the specific pair that triggered the fracture. Other occurrences of the same words in the text remain in their original state. This serves as a visual anchor indicating which exact text segment is currently being analyzed.
• Navigation: The button in State 2 and 3 returns the system to State 1. The button in State 1 returns to State 0.

<a href="https://eqlectika.github.io/demo.html"><img src="logo.png" width="48" height="48" alt="logo"></a>