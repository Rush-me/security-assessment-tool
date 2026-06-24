package com.thalesgroup.isra.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${isra.upload.dir}") String uploadDir) {
        // Expand user.home if present in path
        if (uploadDir.startsWith("~")) {
            uploadDir = System.getProperty("user.home") + uploadDir.substring(1);
        }
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = "";
        
        try {
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            int lastIndex = originalFileName.lastIndexOf('.');
            if (lastIndex > 0) {
                fileExtension = originalFileName.substring(lastIndex);
            }

            // Generate a unique filename using UUID
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            
            // Copy file to the target location (Replacing existing file with the same name)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return targetLocation.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String filePathString) {
        try {
            Path filePath = Paths.get(filePathString).toAbsolutePath().normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new RuntimeException("Invalid file path: " + filePathString);
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found: " + filePathString);
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + filePathString, ex);
        }
    }
}
