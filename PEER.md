<a href="https://eqlectika.github.io"><img src="logo.png" width="48" height="48" alt="logo"></a>
#Peer Visual Exchange
This is an experimental demo model of a decentralized node that can be instantly deployed to test the mechanics of real-time P2P interaction.
To test the system, simply open the link in two different browser windows and establish a direct connection between the windows using password exchange without the need for a server.
Technical Framework
The system core is built on Three.js for visualization and PeerJS (WebRTC) for establishing direct P2P connections. All logic is encapsulated in a single HTML file, allowing the node to function in any environment that supports WebGL. Local synchronization between tabs is further enhanced via BroadcastChannel.
Key Mechanics
* State Synchronization: When nodes connect, objects (tokens) are broadcast in real time. Any action—creating an icosahedron or "picking" one—is instantly reflected by all network participants.
* Game Economy: A limited balance model has been implemented. Every object thrown into space is debited from the account, and every object picked up is credited back, with one caveat.
* Navigation: 3D vacuum navigation with kinetic damping and a system for repelling objects as the camera approaches is implemented.
Model Status
This code is a sandbox for testing data transfer. Withdraw and transaction confirmation functions are simulated, demonstrating the user's path to interacting with assets without performing actual transactions on the blockchain.
<a href="https://eqlectika.github.io"><img src="logo.png" width="48" height="48" alt="logo"></a>