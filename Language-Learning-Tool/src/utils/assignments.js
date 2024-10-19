const handleSave = async () => {
  if (validateForm()) {
    const assignmentData = {
      product: 'Language Learning Tool',
      tasks: selectedTasks,
      assignmentName: assignmentName,
      startDate: startDate,
      endDate: endDate,
      selectedClasses: selectedClasses,
      selectedLearners: selectedLearners,
      isEExam: isEExam,
      attempts: attempts,
    };

    try {
      // Update the URL to the backend's correct port
      const response = await axios.post('http://localhost:5000/assignments', assignmentData);
      
      if (response.data.success) {
        alert('Assignment saved successfully!');
        
        // Save to Local Storage
        const storedAssignments = JSON.parse(localStorage.getItem('assignments')) || [];
        const updatedAssignments = [...storedAssignments, assignmentData];
        localStorage.setItem('assignments', JSON.stringify(updatedAssignments));

        // Navigate to Assign page and pass the newly saved assignment data
        navigate('/assign', { state: { assignmentData } });
      } else {
        alert('Failed to save the assignment.');
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('An error occurred while saving the assignment.');
    }
  }
};
