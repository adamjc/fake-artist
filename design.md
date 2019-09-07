computer / big screen -> fake-artist/ -> fake-artist/new 
phone -> fake-artist/ -> fake-artist/join

Similar design to jackbox games, you connect to a website, gives you a code which you put in on your phone.

Can have an interactive element (i.e. you draw on your phone, it updates the screen)

OR

Just give me the words (going to use a physical board instead)

The design will make sure _nobody_ knows who the fake is, and anyone could be the fake

mvp

slice 1

"just give me the words"

fake-artist/new can generate room for people to enter
fake-artist/join will let people join a given room
can start the game (assign roles & word / phrase)

slice 2

turn-based round-robin
drawable canvas
updates fake-artist/show
ends after a certain time / number of turns

# Questions

To make working with web sockets easier, we will use EC2s rather than lambdas, the downside is we'll have to have a deployment step (can use CodeBuild / CodePipeline / CodeDeploy)

Probs easiest to use express & react

If game becomes popular enough will have to think about LB & distribution of clients (using shared cache like redis or something)