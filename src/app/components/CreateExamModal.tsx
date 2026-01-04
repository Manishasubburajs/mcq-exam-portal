"use client"
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Checkbox,
  Card,
  CardContent,
  Divider,
  Switch,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Assessment,
  LiveTv,
} from '@mui/icons-material';

interface PracticeExamForm {
  examName: string;
  subjects: { subjectId: number, questionCount: number }[];
  totalMarks: number;
  randomizeQuestions: boolean;
  showResults: boolean;
  allowReview: boolean;
}

interface MockExamForm {
  examName: string;
  selectedSubjectId: number;
  topics: { topicId: number, questionCount: number }[];
  totalDuration: number;
  totalMarks: number;
  negativeMarking: boolean;
  passPercentage: number;
  startDate: string;
  endDate: string;
  proctoring: boolean;
  randomizeQuestions: boolean;
}

interface LiveExamForm {
  examName: string;
  selectedSubjectId: number;
  topics: { topicId: number, questionCount: number }[];
  totalDuration: number;
  totalMarks: number;
  startDateTime: string;
  participantCapacity: number;
  registrationDeadline: string;
  proctoringEnabled: boolean;
  autoSubmit: boolean;
  allowCamera: boolean;
  requireID: boolean;
}

interface CreateExamModalProps {
  open: boolean;
  onClose: () => void;
  examTypeSelection: 'select' | 'practice' | 'mock' | 'live' | '';
  setExamTypeSelection: (type: 'select' | 'practice' | 'mock' | 'live' | '') => void;
  practiceExamForm: PracticeExamForm;
  setPracticeExamForm: (form: PracticeExamForm) => void;
  mockExamForm: MockExamForm;
  setMockExamForm: (form: MockExamForm) => void;
  liveExamForm: LiveExamForm;
  setLiveExamForm: (form: LiveExamForm) => void;
  subjects: any[];
  topics: any[];
  questionCounts: {[key: string]: number};
  onSubmitPractice: () => void;
  onSubmitMock: () => void;
  onSubmitLive: () => void;
  fetchTopicsForSubject: (subjectId: number) => void;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({
  open,
  onClose,
  examTypeSelection,
  setExamTypeSelection,
  practiceExamForm,
  setPracticeExamForm,
  mockExamForm,
  setMockExamForm,
  liveExamForm,
  setLiveExamForm,
  subjects,
  topics,
  questionCounts,
  onSubmitPractice,
  onSubmitMock,
  onSubmitLive,
  fetchTopicsForSubject,
}) => {
  const handleExamTypeSelect = (type: 'practice' | 'mock' | 'live') => {
    setExamTypeSelection(type);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Create New Exam</DialogTitle>
      <DialogContent dividers sx={{ minHeight: '500px' }}>
        {examTypeSelection === 'select' && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              What kind of exam do you want to create?
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={examTypeSelection || ''}
                onChange={(e) => handleExamTypeSelect(e.target.value as 'practice' | 'mock' | 'live')}
              >
                <FormControlLabel
                  value="practice"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PlayArrow color="primary" />
                      <Box>
                        <Typography variant="subtitle1">Practice Exam</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Self-paced learning with instant feedback and explanations
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="mock"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Assessment color="secondary" />
                      <Box>
                        <Typography variant="subtitle1">Mock Exam</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Simulated exam environment with time limits and scoring
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="live"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LiveTv color="error" />
                      <Box>
                        <Typography variant="subtitle1">Live Exam</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Real-time proctored examination with scheduled sessions
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* Practice Exam Form */}
        {examTypeSelection === 'practice' && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Practice Exam Setup</Typography>

            <Grid container spacing={2}>
              <Grid size={{xs:12}}>
                <TextField
                  fullWidth
                  label="Exam Name *"
                  value={practiceExamForm.examName}
                  onChange={(e) => setPracticeExamForm({...practiceExamForm, examName: e.target.value})}
                  required
                />
              </Grid>

              <Grid size={{xs:12}}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Select Subjects and Question Counts</Typography>
                {subjects.map((subject) => (
                  <Card key={subject.subject_id} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Checkbox
                        checked={practiceExamForm.subjects.some(s => s.subjectId === subject.subject_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPracticeExamForm({
                              ...practiceExamForm,
                              subjects: [...practiceExamForm.subjects, { subjectId: subject.subject_id, questionCount: 1 }]
                            });
                          } else {
                            setPracticeExamForm({
                              ...practiceExamForm,
                              subjects: practiceExamForm.subjects.filter(s => s.subjectId !== subject.subject_id)
                            });
                          }
                        }}
                      />
                      <Typography sx={{ flex: 1 }}>{subject.subject_name}</Typography>
                      {practiceExamForm.subjects.find(s => s.subjectId === subject.subject_id) && (
                        <TextField
                          type="number"
                          label="Questions"
                          size="small"
                          value={practiceExamForm.subjects.find(s => s.subjectId === subject.subject_id)?.questionCount || 1}
                          onChange={(e) => {
                            const count = Math.max(1, Number(e.target.value));
                            setPracticeExamForm({
                              ...practiceExamForm,
                              subjects: practiceExamForm.subjects.map(s =>
                                s.subjectId === subject.subject_id ? { ...s, questionCount: count } : s
                              )
                            });
                          }}
                          inputProps={{ min: 1 }}
                          sx={{ width: 100 }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Available: {questionCounts[`subject_${subject.subject_id}`] || 0}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Total Marks *"
                  type="number"
                  value={practiceExamForm.totalMarks}
                  onChange={(e) => setPracticeExamForm({...practiceExamForm, totalMarks: Number(e.target.value)})}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid size={{xs:12}}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={practiceExamForm.randomizeQuestions}
                        onChange={(e) => setPracticeExamForm({...practiceExamForm, randomizeQuestions: e.target.checked})}
                      />
                    }
                    label="Randomize Question Order"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={practiceExamForm.showResults}
                        onChange={(e) => setPracticeExamForm({...practiceExamForm, showResults: e.target.checked})}
                      />
                    }
                    label="Show Results Immediately"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={practiceExamForm.allowReview}
                        onChange={(e) => setPracticeExamForm({...practiceExamForm, allowReview: e.target.checked})}
                      />
                    }
                    label="Allow Answer Review"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Mock Exam Form */}
        {examTypeSelection === 'mock' && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Mock Exam Setup</Typography>

            <Grid container spacing={2}>
              <Grid size={{xs:12}}>
                <TextField
                  fullWidth
                  label="Exam Name *"
                  value={mockExamForm.examName}
                  onChange={(e) => setMockExamForm({...mockExamForm, examName: e.target.value})}
                  required
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <FormControl fullWidth>
                  <InputLabel>Select Subject *</InputLabel>
                  <Select
                    value={mockExamForm.selectedSubjectId}
                    onChange={(e) => {
                      const subjectId = Number(e.target.value);
                      setMockExamForm({...mockExamForm, selectedSubjectId: subjectId, topics: []});
                      fetchTopicsForSubject(subjectId);
                    }}
                    label="Select Subject *"
                    required
                  >
                    <MenuItem value={0}>Select Subject</MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Total Marks *"
                  type="number"
                  value={mockExamForm.totalMarks}
                  onChange={(e) => setMockExamForm({...mockExamForm, totalMarks: Number(e.target.value)})}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Total Duration (minutes) *"
                  type="number"
                  value={mockExamForm.totalDuration}
                  onChange={(e) => setMockExamForm({...mockExamForm, totalDuration: Number(e.target.value)})}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Pass Percentage"
                  type="number"
                  value={mockExamForm.passPercentage}
                  onChange={(e) => setMockExamForm({...mockExamForm, passPercentage: Number(e.target.value)})}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Start Date & Time *"
                  type="datetime-local"
                  value={mockExamForm.startDate}
                  onChange={(e) => setMockExamForm({...mockExamForm, startDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="End Date & Time *"
                  type="datetime-local"
                  value={mockExamForm.endDate}
                  onChange={(e) => setMockExamForm({...mockExamForm, endDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              {mockExamForm.selectedSubjectId > 0 && (
                <Grid size={{xs:12}}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Select Topics and Question Counts</Typography>
                  {topics.map((topic) => (
                    <Card key={topic.topic_id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Checkbox
                          checked={mockExamForm.topics.some(t => t.topicId === topic.topic_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMockExamForm({
                                ...mockExamForm,
                                topics: [...mockExamForm.topics, { topicId: topic.topic_id, questionCount: 1 }]
                              });
                            } else {
                              setMockExamForm({
                                ...mockExamForm,
                                topics: mockExamForm.topics.filter(t => t.topicId !== topic.topic_id)
                              });
                            }
                          }}
                        />
                        <Typography sx={{ flex: 1 }}>{topic.topic_name}</Typography>
                        {mockExamForm.topics.find(t => t.topicId === topic.topic_id) && (
                          <TextField
                            type="number"
                            label="Questions"
                            size="small"
                            value={mockExamForm.topics.find(t => t.topicId === topic.topic_id)?.questionCount || 1}
                            onChange={(e) => {
                              const count = Math.max(1, Number(e.target.value));
                              setMockExamForm({
                                ...mockExamForm,
                                topics: mockExamForm.topics.map(t =>
                                  t.topicId === topic.topic_id ? { ...t, questionCount: count } : t
                                )
                              });
                            }}
                            inputProps={{ min: 1 }}
                            sx={{ width: 100 }}
                          />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Available: {questionCounts[`topic_${topic.topic_id}`] || 0}
                        </Typography>
                      </Box>
                    </Card>
                  ))}
                </Grid>
              )}

              <Grid size={{xs:12}}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mockExamForm.negativeMarking}
                        onChange={(e) => setMockExamForm({...mockExamForm, negativeMarking: e.target.checked})}
                      />
                    }
                    label="Enable Negative Marking"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mockExamForm.proctoring}
                        onChange={(e) => setMockExamForm({...mockExamForm, proctoring: e.target.checked})}
                      />
                    }
                    label="Enable Proctoring"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mockExamForm.randomizeQuestions}
                        onChange={(e) => setMockExamForm({...mockExamForm, randomizeQuestions: e.target.checked})}
                      />
                    }
                    label="Randomize Questions"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Live Exam Form */}
        {examTypeSelection === 'live' && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Live Exam Setup</Typography>

            <Grid container spacing={2}>
              <Grid size={{xs:12}}>
                <TextField
                  fullWidth
                  label="Exam Name *"
                  value={liveExamForm.examName}
                  onChange={(e) => setLiveExamForm({...liveExamForm, examName: e.target.value})}
                  required
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <FormControl fullWidth>
                  <InputLabel>Select Subject *</InputLabel>
                  <Select
                    value={liveExamForm.selectedSubjectId}
                    onChange={(e) => {
                      const subjectId = Number(e.target.value);
                      setLiveExamForm({...liveExamForm, selectedSubjectId: subjectId, topics: []});
                      fetchTopicsForSubject(subjectId);
                    }}
                    label="Select Subject *"
                    required
                  >
                    <MenuItem value={0}>Select Subject</MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Total Marks *"
                  type="number"
                  value={liveExamForm.totalMarks}
                  onChange={(e) => setLiveExamForm({...liveExamForm, totalMarks: Number(e.target.value)})}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Total Duration (minutes) *"
                  type="number"
                  value={liveExamForm.totalDuration}
                  onChange={(e) => setLiveExamForm({...liveExamForm, totalDuration: Number(e.target.value)})}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Participant Capacity"
                  type="number"
                  value={liveExamForm.participantCapacity}
                  onChange={(e) => setLiveExamForm({...liveExamForm, participantCapacity: Number(e.target.value)})}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Start Date & Time *"
                  type="datetime-local"
                  value={liveExamForm.startDateTime}
                  onChange={(e) => setLiveExamForm({...liveExamForm, startDateTime: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid size={{xs:12, md:6}}>
                <TextField
                  fullWidth
                  label="Registration Deadline"
                  type="datetime-local"
                  value={liveExamForm.registrationDeadline}
                  onChange={(e) => setLiveExamForm({...liveExamForm, registrationDeadline: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {liveExamForm.selectedSubjectId > 0 && (
                <Grid size={{xs:12}}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Select Topics and Question Counts</Typography>
                  {topics.map((topic) => (
                    <Card key={topic.topic_id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Checkbox
                          checked={liveExamForm.topics.some(t => t.topicId === topic.topic_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLiveExamForm({
                                ...liveExamForm,
                                topics: [...liveExamForm.topics, { topicId: topic.topic_id, questionCount: 1 }]
                              });
                            } else {
                              setLiveExamForm({
                                ...liveExamForm,
                                topics: liveExamForm.topics.filter(t => t.topicId !== topic.topic_id)
                              });
                            }
                          }}
                        />
                        <Typography sx={{ flex: 1 }}>{topic.topic_name}</Typography>
                        {liveExamForm.topics.find(t => t.topicId === topic.topic_id) && (
                          <TextField
                            type="number"
                            label="Questions"
                            size="small"
                            value={liveExamForm.topics.find(t => t.topicId === topic.topic_id)?.questionCount || 1}
                            onChange={(e) => {
                              const count = Math.max(1, Number(e.target.value));
                              setLiveExamForm({
                                ...liveExamForm,
                                topics: liveExamForm.topics.map(t =>
                                  t.topicId === topic.topic_id ? { ...t, questionCount: count } : t
                                )
                              });
                            }}
                            inputProps={{ min: 1 }}
                            sx={{ width: 100 }}
                          />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Available: {questionCounts[`topic_${topic.topic_id}`] || 0}
                        </Typography>
                      </Box>
                    </Card>
                  ))}
                </Grid>
              )}

              <Grid size={{xs:12}}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={liveExamForm.proctoringEnabled}
                        onChange={(e) => setLiveExamForm({...liveExamForm, proctoringEnabled: e.target.checked})}
                      />
                    }
                    label="Enable Proctoring"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={liveExamForm.autoSubmit}
                        onChange={(e) => setLiveExamForm({...liveExamForm, autoSubmit: e.target.checked})}
                      />
                    }
                    label="Auto-submit on Time End"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={liveExamForm.allowCamera}
                        onChange={(e) => setLiveExamForm({...liveExamForm, allowCamera: e.target.checked})}
                      />
                    }
                    label="Require Camera Access"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={liveExamForm.requireID}
                        onChange={(e) => setLiveExamForm({...liveExamForm, requireID: e.target.checked})}
                      />
                    }
                    label="Require ID Verification"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        {examTypeSelection === 'select' && (
          <Button
            variant="contained"
            disabled={!examTypeSelection || examTypeSelection === 'select'}
          >
            Continue
          </Button>
        )}

        {examTypeSelection === 'practice' && (
          <Button
            variant="contained"
            onClick={onSubmitPractice}
            sx={{
              background: 'linear-gradient(to right, #6a11cb, #2575fc)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Create Practice Exam
          </Button>
        )}

        {examTypeSelection === 'mock' && (
          <Button
            variant="contained"
            onClick={onSubmitMock}
            sx={{
              background: 'linear-gradient(to right, #6a11cb, #2575fc)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Create Mock Exam
          </Button>
        )}

        {examTypeSelection === 'live' && (
          <Button
            variant="contained"
            onClick={onSubmitLive}
            sx={{
              background: 'linear-gradient(to right, #6a11cb, #2575fc)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Create Live Exam
          </Button>
        )}

        {examTypeSelection !== 'select' && examTypeSelection !== '' && (
          <Button
            variant="outlined"
            onClick={() => setExamTypeSelection('select')}
          >
            Back
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateExamModal;