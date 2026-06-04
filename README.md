<a href="https://eqlectika.github.io"><img src="logo.png" width="48" height="48" alt="logo"></a>
# The Concept of Semantic Field Core
Imagine for a moment that anything is possible. Imagine, for example, that the laws of physics were suddenly replaced by the laws of imagination. And this is a very interesting meditation, because it begins like this: "Well, if I could have anything I wanted, what would I want, or what would I prefer to have?" For example, I would somehow move the Vatican Library to Versailles and live in Versailles, have access to every book and work of art that ever existed, and stroll in the garden.

And then I start thinking about it and clarify: "No, but the question was: 'What would it be like if it could be anything?'" So why do you need Versailles, why do you need the Vatican Library, if you can have anything? And you realize that our imagination is completely limited.

Who would we become if we could become anything? I mean, what if I could snap my fingers and you became omnipotent, what would you do?

The first thing I'd do is fly. I'd just leap a kilometer into the sky and give a cowboy whoop... But then we might realize that the universe is entirely at your disposal, that you can cross the galaxy in the blink of an eye. You could travel back to the moment of the Big Bang in the time it takes to think about it.

There's not a single civilization in the history of creation, not a single work of art, not a single delight or experience that's denied you.

And I maintain that within minutes of this transformation, we would become unrecognizable to ourselves, since we're usually completely defined by our limitations.

And that's how I imagine death to be. Death is a peace, so profoundly subconscious that it becomes a revelation that you can be, do, see, think, and feel anything.

In the context of singularity, beyond the dualism of matter and consciousness, a third force emerges—Information. This is not simply a collection of data, but a stable, decentralized environment with its own gravity. In this system, information is viewed not as dry concepts, but as an arrangement of the statics of space and the dynamics of free geometric forms, possessing the phenomenal right of spontaneity.
This is the visual, symbolic core of the internet, operating on the principle of an immutable chain without a central server. The basis of the universal node (decentralized terminal) is the Cube. Any user can expand it from within, thus creating their own unique 3D symbol. Each such arrangement is stored as hash blocks, ensuring user independence.
The process of creation is like the growth of a crystal in a void: Clicking on the edge of the cube erases and advances the space by one cube.
All facets are initially transparent, but can change their density from 0.0 to 1.0 with a long press.
This is an environment of real online presence. The subject manifests in the field only upon connection, broadcasting their form via peer-to-peer protocols.
Each user's point of origin is fixed and encrypted via an IP address, ensuring a stable "geography"—when you turn on, you always find yourself in a familiar location relative to others.
Different forms can intersect. Other facets are not a barrier—the subject is limited only by their own form, but can freely travel through other architectures at their overlapping points.
This system has no route history to conserve memory; there is only the currently broadcast illusion. The form can change offline and directly during the broadcast. This is a living process, where users themselves shape their illusion, recording its recognizability in the decentralized ether.

Imagine a world where the landscape doesn’t sink below the horizon but rises above you, closing into a massive dome overhead. Standing in London, you could look straight up and see Australia, other continents, oceans, and cities. Everything on the planet is visible through a telescope because you are inside a sphere, and gravity points outward.
Since existing visual tools couldn’t capture this specific concave geometry properly, the project was built from scratch using JavaScript.

Current Features

The project is currently a live web-based physics and environment simulation:
Inverted Sphere Physics: A fully functional concave world with gravity directed from the center outward. The thrust direction is completely independent.
Cross-Platform Controls: Implemented for both desktop and mobile (touchscreen split into thrust and steering zones).
VR Support: A dedicated version for Oculus VR headsets is available via the butterfly logo menu at the bottom of the screen.
The current focus is on developing the landscape mechanics and terrain generation.

Live Demo

You can test the mechanics and explore the inverted world directly in your browser:
<a href="eqlectika.github.io/life.html'>Life</a>

##Desktop Controls:
Arrow keys – Movement.
Single / Double tap Space – Thrust control.

Mobile Controls:
Left half of the screen – Thrust.
Right half of the screen – Steering.

Joining the Development

The ultimate goal of Eqlectika goes beyond a single inverted planet. The vision is to build an ecosystem where different planets can exist, each running on its own custom logic and scenarios via GitHub.

How you can support the project:
• Development (GitHub): Looking for JS developers and WebGL/Three.js enthusiasts to help with optimization, procedural landscape generation, and scripting new planetary physics.
• Spreading the Word: This is a non-commercial open-source project. Any feedback, shares, or GitHub stars are greatly appreciated and help bring more developers into the loop.

If you are fascinated by non-standard astrophysics and creative coding, feel free to dive in!
To achieve smooth, independent movement inside a concave sphere without running into the infamous Gimbal Lock, we had to abandon standard Euler angles for player rotation. Instead, we use quaternions to calculate rotation deltas relative to the object’s current orientation.


