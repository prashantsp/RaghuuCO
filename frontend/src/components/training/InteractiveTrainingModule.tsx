/**
 * Interactive Training Module Component
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 *
 * @description This component provides interactive training modules with
 * hands-on exercises, simulated scenarios, and progress tracking for
 * comprehensive user training.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  CheckCircle,
  Error,
  Help,
  Info,
  ExpandMore,
  NavigateNext,
  NavigateBefore,
  Home,
  Book,
  School,
  Assignment,
  Quiz,
  EmojiEvents,
  Timer,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { logger } from '@/utils/logger';

/**
 * Training scenario interface
 */
interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  steps: TrainingStep[];
  prerequisites: string[];
  learningObjectives: string[];
  tags: string[];
}

/**
 * Training step interface
 */
interface TrainingStep {
  id: string;
  title: string;
  description: string;
  type: 'instruction' | 'interactive' | 'quiz' | 'simulation';
  content: any;
  validation?: (userInput: any) => boolean;
  hints: string[];
  maxAttempts: number;
  points: number;
}

/**
 * User progress interface
 */
interface UserProgress {
  moduleId: string;
  completedSteps: string[];
  currentStep: number;
  score: number;
  timeSpent: number;
  attempts: Record<string, number>;
  completedAt?: Date;
}

/**
 * Interactive Training Module Props
 */
interface InteractiveTrainingModuleProps {
  moduleId: string;
  scenario: TrainingScenario;
  onComplete: (progress: UserProgress) => void;
  onProgress: (progress: UserProgress) => void;
  initialProgress?: UserProgress;
  showHints?: boolean;
  allowRetries?: boolean;
  autoSave?: boolean;
}

/**
 * Interactive Training Module Component
 */
const InteractiveTrainingModule: React.FC<InteractiveTrainingModuleProps> = ({
  moduleId,
  scenario,
  onComplete,
  onProgress,
  initialProgress,
  showHints = true,
  allowRetries = true,
  autoSave = true
}) => {
  const theme = useTheme();
  const { isHighContrast, isReducedMotion } = useAccessibility();
  const { updateProgress, getProgress } = useTrainingProgress();

  // State management
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>(
    initialProgress || {
      moduleId,
      completedSteps: [],
      currentStep: 0,
      score: 0,
      timeSpent: 0,
      attempts: {}
    }
  );
  const [userInput, setUserInput] = useState<any>({});
  const [stepAttempts, setStepAttempts] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const currentStep = scenario.steps[currentStepIndex];
  const isLastStep = currentStepIndex === scenario.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const progressPercentage = (currentStepIndex / scenario.steps.length) * 100;
  const timeElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);

  // Auto-save progress
  useEffect(() => {
    if (autoSave) {
      const interval = setInterval(() => {
        saveProgress();
      }, 30000); // Save every 30 seconds

      return () => clearInterval(interval);
    }
  }, [userProgress, autoSave]);

  // Load progress on mount
  useEffect(() => {
    const savedProgress = getProgress(moduleId);
    if (savedProgress) {
      setUserProgress(savedProgress);
      setCurrentStepIndex(savedProgress.currentStep);
    }
  }, [moduleId, getProgress]);

  // Save progress
  const saveProgress = useCallback(() => {
    const progress: UserProgress = {
      ...userProgress,
      currentStep: currentStepIndex,
      timeSpent: timeElapsed
    };

    setUserProgress(progress);
    updateProgress(moduleId, progress);
    onProgress(progress);
    logger.info('Training progress saved', { moduleId, currentStep: currentStepIndex });
  }, [userProgress, currentStepIndex, timeElapsed, moduleId, updateProgress, onProgress]);

  // Handle step completion
  const handleStepComplete = useCallback((stepId: string, score: number) => {
    const newProgress: UserProgress = {
      ...userProgress,
      completedSteps: [...userProgress.completedSteps, stepId],
      score: userProgress.score + score,
      currentStep: currentStepIndex + 1
    };

    setUserProgress(newProgress);
    setStepAttempts({ ...stepAttempts, [stepId]: (stepAttempts[stepId] || 0) + 1 });

    if (isLastStep) {
      newProgress.completedAt = new Date();
      setShowCompletionDialog(true);
      onComplete(newProgress);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
      setUserInput({});
      setShowHint(false);
    }

    saveProgress();
  }, [userProgress, currentStepIndex, isLastStep, stepAttempts, onComplete, saveProgress]);

  // Handle step validation
  const handleStepValidation = useCallback(() => {
    if (!currentStep.validation) {
      handleStepComplete(currentStep.id, currentStep.points);
      return;
    }

    const isValid = currentStep.validation(userInput);
    const attempts = (stepAttempts[currentStep.id] || 0) + 1;

    if (isValid) {
      handleStepComplete(currentStep.id, currentStep.points);
    } else if (attempts >= currentStep.maxAttempts && !allowRetries) {
      // Step failed
      setStepAttempts({ ...stepAttempts, [currentStep.id]: attempts });
      logger.warn('Step validation failed', { stepId: currentStep.id, attempts });
    } else {
      setStepAttempts({ ...stepAttempts, [currentStep.id]: attempts });
      setShowHint(true);
    }
  }, [currentStep, userInput, stepAttempts, allowRetries, handleStepComplete]);

  // Navigation handlers
  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
      setUserInput({});
      setShowHint(false);
      saveProgress();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
      setUserInput({});
      setShowHint(false);
      saveProgress();
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setUserProgress({
      moduleId,
      completedSteps: [],
      currentStep: 0,
      score: 0,
      timeSpent: 0,
      attempts: {}
    });
    setUserInput({});
    setStepAttempts({});
    setShowHint(false);
    setStartTime(new Date());
  };

  // Render step content based on type
  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'instruction':
        return (
          <Box>
            <Typography variant="body1" paragraph>
              {currentStep.content.text}
            </Typography>
            {currentStep.content.image && (
              <Box
                component="img"
                src={currentStep.content.image}
                alt={currentStep.title}
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  my: 2
                }}
              />
            )}
            <Button
              variant="contained"
              onClick={handleStepValidation}
              startIcon={<NavigateNext />}
            >
              Continue
            </Button>
          </Box>
        );

      case 'interactive':
        return (
          <Box>
            <Typography variant="body1" paragraph>
              {currentStep.content.instructions}
            </Typography>
            <InteractiveExercise
              exercise={currentStep.content}
              userInput={userInput}
              onInputChange={setUserInput}
              onComplete={handleStepValidation}
            />
          </Box>
        );

      case 'quiz':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {currentStep.content.question}
            </Typography>
            <QuizComponent
              quiz={currentStep.content}
              userInput={userInput}
              onInputChange={setUserInput}
              onComplete={handleStepValidation}
            />
          </Box>
        );

      case 'simulation':
        return (
          <Box>
            <Typography variant="body1" paragraph>
              {currentStep.content.description}
            </Typography>
            <SimulationComponent
              simulation={currentStep.content}
              userInput={userInput}
              onInputChange={setUserInput}
              onComplete={handleStepValidation}
            />
          </Box>
        );

      default:
        return <Typography>Unknown step type</Typography>;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {scenario.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {scenario.description}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Help">
                <IconButton onClick={() => setShowHelpDialog(true)}>
                  <Help />
                </IconButton>
              </Tooltip>
              <Tooltip title={audioEnabled ? 'Mute Audio' : 'Enable Audio'}>
                <IconButton onClick={() => setAudioEnabled(!audioEnabled)}>
                  {audioEnabled ? <VolumeUp /> : <VolumeOff />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Progress and Stats */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" gap={2} alignItems="center">
              <Chip
                icon={<School />}
                label={`Step ${currentStepIndex + 1} of ${scenario.steps.length}`}
                color="primary"
              />
              <Chip
                icon={<EmojiEvents />}
                label={`Score: ${userProgress.score}`}
                color="secondary"
              />
              <Chip
                icon={<Timer />}
                label={`Time: ${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`}
                variant="outlined"
              />
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={() => setIsPaused(!isPaused)}
                startIcon={isPaused ? <PlayArrow /> : <Pause />}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                startIcon={<Refresh />}
              >
                Reset
              </Button>
            </Box>
          </Box>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Stepper */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Module Progress
            </Typography>
            <Stepper orientation="vertical" activeStep={currentStepIndex}>
              {scenario.steps.map((step, index) => (
                <Step key={step.id}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: userProgress.completedSteps.includes(step.id)
                            ? 'success.main'
                            : index === currentStepIndex
                            ? 'primary.main'
                            : 'grey.300',
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                      >
                        {userProgress.completedSteps.includes(step.id) ? (
                          <CheckCircle fontSize="small" />
                        ) : (
                          index + 1
                        )}
                      </Box>
                    )}
                  >
                    <Typography variant="body2">{step.title}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        {/* Step Content */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                  {currentStep.title}
                </Typography>
                <Chip
                  label={currentStep.type}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {renderStepContent()}

              {/* Hints */}
              {showHints && currentStep.hints.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Hint:
                  </Typography>
                  <Typography variant="body2">
                    {currentStep.hints[Math.min(stepAttempts[currentStep.id] || 0, currentStep.hints.length - 1)]}
                  </Typography>
                </Alert>
              )}

              {/* Navigation */}
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  startIcon={<NavigateBefore />}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isLastStep}
                  endIcon={<NavigateNext />}
                >
                  Next
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Module Completed!</DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={2}>
            <EmojiEvents sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Congratulations!
            </Typography>
            <Typography variant="body1" paragraph>
              You have successfully completed the "{scenario.title}" training module.
            </Typography>
            <Box display="flex" justifyContent="space-around" mt={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {userProgress.score}
                </Typography>
                <Typography variant="body2">Total Score</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="secondary">
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                </Typography>
                <Typography variant="body2">Time Spent</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompletionDialog(false)}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} maxWidth="md" fullWidth>
        <DialogTitle>Training Module Help</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            How to Use This Training Module
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Book />
              </ListItemIcon>
              <ListItemText
                primary="Read Instructions Carefully"
                secondary="Each step contains important information. Take your time to understand the content."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Assignment />
              </ListItemIcon>
              <ListItemText
                primary="Complete Interactive Exercises"
                secondary="Follow the instructions and complete the exercises to progress through the module."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Quiz />
              </ListItemIcon>
              <ListItemText
                primary="Answer Quiz Questions"
                secondary="Test your knowledge with quiz questions. You can retry if needed."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <School />
              </ListItemIcon>
              <ListItemText
                primary="Practice with Simulations"
                secondary="Use simulations to practice real-world scenarios in a safe environment."
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelpDialog(false)}>
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/**
 * Interactive Exercise Component
 */
const InteractiveExercise: React.FC<{
  exercise: any;
  userInput: any;
  onInputChange: (input: any) => void;
  onComplete: () => void;
}> = ({ exercise, userInput, onInputChange, onComplete }) => {
  const handleInputChange = (field: string, value: any) => {
    onInputChange({ ...userInput, [field]: value });
  };

  switch (exercise.type) {
    case 'form':
      return (
        <Box>
          {exercise.fields.map((field: any) => (
            <TextField
              key={field.name}
              label={field.label}
              value={userInput[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              fullWidth
              margin="normal"
              required={field.required}
              type={field.type}
              multiline={field.multiline}
              rows={field.rows}
            />
          ))}
          <Button variant="contained" onClick={onComplete} sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
      );

    case 'drag-drop':
      return (
        <Box>
          <Typography variant="body2" paragraph>
            Drag and drop the items to match the correct categories:
          </Typography>
          {/* Drag and drop implementation */}
          <Button variant="contained" onClick={onComplete} sx={{ mt: 2 }}>
            Complete Exercise
          </Button>
        </Box>
      );

    default:
      return (
        <Button variant="contained" onClick={onComplete}>
          Complete Exercise
        </Button>
      );
  }
};

/**
 * Quiz Component
 */
const QuizComponent: React.FC<{
  quiz: any;
  userInput: any;
  onInputChange: (input: any) => void;
  onComplete: () => void;
}> = ({ quiz, userInput, onInputChange, onComplete }) => {
  const handleAnswerChange = (answer: string) => {
    onInputChange({ answer });
  };

  return (
    <Box>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={userInput.answer || ''}
          onChange={(e) => handleAnswerChange(e.target.value)}
        >
          {quiz.options.map((option: string, index: number) => (
            <FormControlLabel
              key={index}
              value={option}
              control={<Radio />}
              label={option}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <Button
        variant="contained"
        onClick={onComplete}
        disabled={!userInput.answer}
        sx={{ mt: 2 }}
      >
        Submit Answer
      </Button>
    </Box>
  );
};

/**
 * Simulation Component
 */
const SimulationComponent: React.FC<{
  simulation: any;
  userInput: any;
  onInputChange: (input: any) => void;
  onComplete: () => void;
}> = ({ simulation, userInput, onInputChange, onComplete }) => {
  return (
    <Box>
      <Typography variant="body2" paragraph>
        {simulation.instructions}
      </Typography>
      {/* Simulation interface would be implemented here */}
      <Button variant="contained" onClick={onComplete} sx={{ mt: 2 }}>
        Complete Simulation
      </Button>
    </Box>
  );
};

export default InteractiveTrainingModule;