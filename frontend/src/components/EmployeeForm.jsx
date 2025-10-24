import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addEmployee, getEmployeeById, updateEmployee } from '../services/employeeService';
import { getAllDepartments, searchDepartments } from '../services/departmentService';
import { TextField, Button, MenuItem, Box, CircularProgress, Autocomplete } from '@mui/material';
import { styled } from '@mui/system';

const CenteredSpinner = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
});

const EmployeeForm = () => {
  const [employee, setEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    department: { id: '', name: '' },
  });
  const [query, setQuery] = useState('');
  const [deptOptions, setDeptOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let debounceTimer;
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        let data;
        if (query) {
          data = await searchDepartments(query);
        } else {
          data = await getAllDepartments();
        }
        setDeptOptions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setLoading(false);
      }
    };

    debounceTimer = setTimeout(fetchDepartments, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, searchDepartments, getAllDepartments]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const employeeData = await getEmployeeById(id);
          if (employeeData) {
            setEmployee({
              firstName: employeeData.firstName || '',
              lastName: employeeData.lastName || '',
              email: employeeData.email || '',
              age: employeeData.age || '',
              department: {
                id: employeeData.department ? employeeData.department.id : '',
                name: employeeData.department ? employeeData.department.name : '',
              },
            });
            setQuery(employeeData.department?.name || '');
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'department.id') {
      setEmployee({ ...employee, department: { id: value } });
    } else {
      setEmployee({
        ...employee,
        [name]: name === 'age' ? Number(value) : value, // Convert age to number
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (id) {
        await updateEmployee(id, employee);
      } else {
        await addEmployee(employee);
      }
      setIsLoading(false);
      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <CenteredSpinner>
        <CircularProgress />
      </CenteredSpinner>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { marginBottom: '1rem', width: '100%' } }}>
      <h2>{id ? 'Edit Employee' : 'Add Employee'}</h2>
      <TextField label="First Name" name="firstName" value={employee.firstName} onChange={handleChange} required />
      <TextField label="Last Name" name="lastName" value={employee.lastName} onChange={handleChange} required />
      <TextField label="Email" name="email" type="email" value={employee.email} onChange={handleChange} required />
      <TextField label="Age" name="age" type="number" value={employee.age} onChange={handleChange} required inputProps={{ min: 1, max: 150 }} />
      <Autocomplete
        options={deptOptions}
        getOptionLabel={(option) => option.name || ''}
        getOptionKey={option => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onInputChange={(event, newInputValue) => {
          setQuery(newInputValue);
        }}
        onChange={(event, newValue) => {
          if (newValue) {
            setEmployee({ ...employee, department: { id: newValue.id, name: newValue.name } });
            setQuery(newValue.name);
          } else {
            setEmployee({ ...employee, department: { id: '', name: '' } });
            setQuery('');
          }
        }}
        value={employee.department}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Department"
            required
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="small" /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      <Button type="submit" variant="contained" color="primary" sx={{ marginTop: '1rem' }}>
        Save
      </Button>
    </Box>
  );
};

export default EmployeeForm;
