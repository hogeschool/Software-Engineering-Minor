# Introduction
Complete the missing definitions by replacing the blanks `__`.

Each question is worth one point. Answers are either fully correct according to the definitions of Category Theory (then they get one point) or not (then they get zero points).

> The actual exam will be a random selection of ten questions from the different sections.

## Categories
1. Given two arrows
`f : a -> b`, `g : b -> c`
a category always supports an arrow
`f;g : __ -> __``

1. Given any object
`a`
a category always supports an arrow
`__ : a -> a`

1. Given any arrow
`f : a -> b`
then
`f;id : a -> b == __;__ : a -> b == __ : a -> b`

## Functors
1. Given a functor `F` and two composable arrows `f` and `g`
`F(f;g) == F __; __`

1. Given a functor `F`
`F(id_a) == id_(__)`

1. Given a functor `F` and two arrows `f : a -> b` and `g : b -> c`
`F(f;g) : __ -> __`

1. Given two composable functors `F : C => D` and `G : D => E`
`F;G : __ => __`


## Natural transformations
1. Given a natural transformation `η : F => G`
`η_a : __ => __`

1. Given a natural transformation `η : F => G` and a functor `H`
`H(η) : __ => __`

1. Given a natural transformation `η : F => G` and a functor `H`
`ηH : __ => __`

1. Given two natural transformations `η : F => G` and `ε : G => H`
`η;ε : __ => __`

## Products
1. Given a BCCC
`π1 : __ => __`

1. Given a BCCC
`π2 : __ => __`

1. Given a BCCC and two functions `f : c -> a` and `g : c -> b`
`<f,g> : __ => __`

1. Given a BCCC and two functions `f : a -> c` and `g : b -> d`
`f x g : __ x __ => __ x __`

1. Given a BCCC and two functions `f : a -> c` and `g : b -> d`
`<f,g>;π1 : __ => __`

1. Given a BCCC and two functions `f : a -> c` and `g : b -> d`
`<f,g>;π2 = __`

## Sums
1. Given a BCCC
`ι1 : __ => __`

1. Given a BCCC
`ι2 : __ => __`

1. Given a BCCC and `f : a -> c` and `g : b -> d`
`f+g : __ => __`

1. Given a BCCC and `f : a -> c` and `g : b -> c`
`[f,g] : __ => __`

1. Given a BCCC and `f : a -> c` and `g : b -> c`
`ι1;[f,g] = __`


## Monads
1. Given a monad `M,η,μ`
`η : __ => __`

1. Given a monad `M,η,μ`
`μ : __ => __`

1. Given a monad `M,η,μ`
`Mμ;μ : __ => __`

1. Given a monad `M,η,μ`
`Mμ;μ = __;μ`

1. Given a monad `M,η,μ`
`Mη;μ : __ => __`

1. Given a monad `M,η,μ`
`ηM;μ : __ => __`

1. Given a monad `M,η,μ`
`ηM;μ = __;μ`