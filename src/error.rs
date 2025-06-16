impl From<ProfileError> for CliError {
    fn from(err: ProfileError) -> Self {
        match err {
            ProfileError::NotFound => CliError::ProfileNotFound,
            ProfileError::InvalidFormat => CliError::InvalidProfileFormat,
            ProfileError::IoError(e) => CliError::IoError(e),
            ProfileError::SerializationError(e) => CliError::SerializationError(e),
            // Add mappings for other variants as needed
            _ => CliError::Other(format!("Profile error: {:?}", err)),
        }
    }
} 