## jsTween


jsTween is a simple-to-use but incredibly powerful animations engine for ECMAScript 6.
In short, it allows you to animate *anything* with a minimum of fuss and a maximum
of flexibility. Create *animation targets*, which are values you would like to
animate, and then you can make *Tweens* of those targets, which are the basic building
blocks of animation. *Tweens* are a single transition over time, such as perhaps fading an
item in, or making it drop down. You tell us where to start, end, and how long it should
take. That's it. *Et voilà*, it animates. That's as much as you need to know in order to get
started.

+ Check out the [getting started](#h-getting-started) section to get going right now.
+ Read the extensive [documentation](#h-documentation) for more advanced usage hints.
+ See the [support](#h-support) section for all those important details about browser support and so on.

But that's not all; we can easily go deeper. Easings based on Robert Penner's easing equations
are also built right in. Need it to slide in a certain pattern instead of a straight line?
There's probably already an ease for that, and it's built right into the library. Seek and ye
shall find.

If you need something more complicated, then we can do that too. jsTween easily scales
to the most complex of animation needs by offering *Timelines*, which are ways to add
your Tweens together. A *SeqTimeline* is a sequential timeline in which Tweens happen
one-after-another. First one, then the next, while a *ParTimeline* is a parallel timeline
where all the Tweens happen together. An animation where a box flies out and to the left
while fading out and changing color would be something for a *ParTimeline* whereas an animation
of a duck bobbing around on a lake might require a *SeqTimeline*. Just as a note, Timelines
can also be nested, but only the most complicated animations should ever need this feature.

Did we also mention that jsTweeen is **wickedly fast**? You should check out our unit tests,
there's one that makes sure we can run timelines of 10,000 Tweens in under 10ms. That easily
gets you silky-smooth 60fps for even the most complex of animations. Is jsTween not fast
enough for you? Please file an issue, it's almost certainly a bug. 🥂

## Getting Started<a name="h-getting-started"></a>

Try this:

```JavaScript
var Tween = require('jstween')

//Create a new (numeric) animation target:
var target = new Tween.AnimationTarget(0)

//Create a tween
var tween = Tween.to(target, 0, 1, 5)

//Go go go!
tween.start()

//Observe:
setTimeout(function() {console.log(target.value)}, 1000)
setTimeout(function() {console.log(target.value)}, 2000)
setTimeout(function() {console.log(target.value)}, 3000)
```

Would you like some timelines with that?

```JavaScript
var Tween = require('jstween')

//...
// Assume there is some code here that makes
// some Targets that we want to animate.
//...

//Here is a 1 second long animation which:
// - moves from 0 to 50 in the x direction
// - moves from 0 to 50 in the y direction
// - blinks the target's alpha value
//
// assuming that the target has those properties.
var timeline = Tween.parTimeline(
  Tween.to(target.position.x, 0, 50, 1),
  Tween.to(target.position.y, 0, 50, 1),
  Tween.seqTimeline(
    Tween.to(target.color.alpha, 1, .5, .5),
    Tween.to(target.color.alpha, .5, 1, .5)
  )
);

timeline.start();
```

## Documentation<a name="h-documentation"></a>

The source for jsTween is annotated with typedoc-formatted comments, so there's clean documentation of the entire
library available right away. There should be an accompanying documentation package with each jsTween release,
while you can also compile the documentation at any time using the `typedoc` tool on its own, or run
`npm run doc` to build the docs using our package script. Using the package script will output the docs to
`doc`.

## Support<a name="h-support"></a>

jsTween's initial release focuses on blazing-fast and feature-complete support for ECMAScript 6.
This means it will work well in Node.JS, Chrome, Firefox, Edge, and anything else that has a modern
JavaScript, but might have compatibility issues with IE. We've tried to get the library to work with
older JavaScript engines by building with the `babel` transpiler, so it *should* work with some older
versions of IE, but as of yet, this hasn't been tested. You can try it out, but you have been warned.

jsTween's initial release ships with support for animating simple numeric properties
out-of-the-box, however, jsTween can be easily extended to support animating *any*
other data with a quick extension. This means animating CSS properties like color
or position, or your own custom datatypes. More default interpolation types should be
included in the library in the future.