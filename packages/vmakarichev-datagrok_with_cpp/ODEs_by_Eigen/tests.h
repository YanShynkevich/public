// tests.h

// Declaration of functions for testing methods

#ifndef TESTS_H
#define TESTS_H

// test of one-step method: one-dimensional case
void testOneStepMethodOneDim();

// test of one-step method: multi-dimensional case
void testOneStepMethodMultiDim();

// analysis of solving stiff problem: one-dimensional case
void analyzeStiffProblemOneDim();

// analysis of solving stiff problem: multi-dimensional case
void analyzeStiffProblemMultiDim();

// test ode23s solver
void testODE23sSolver();

// try ode32s solver on the jnj system
void tryODE32sOnJNJ();

// test of ode32s solver in generalized solver: multi-dimensional case
void testODE32sInGeneralSolver();

// test of ode32s solver in generalized solver: multi-dimensional case, jnj problem
void testODE32sInGeneralSolverJNJ();

#endif // !TESTS_H

