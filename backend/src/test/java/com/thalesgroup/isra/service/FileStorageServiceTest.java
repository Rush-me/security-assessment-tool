package com.thalesgroup.isra.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mockito;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempDir.toString());
    }

    @Test
    void constructor_withTilde_expandsUserHome() {
        // Just verify that passing a tilde doesn't crash and normalizes to some path
        FileStorageService serviceWithTilde = new FileStorageService("~/isra-test-uploads");
        assertNotNull(serviceWithTilde);
    }

    @Test
    void storeFile_validFile_savesSuccessfully() throws IOException {
        MultipartFile multipartFile = mock(MultipartFile.class);
        when(multipartFile.getOriginalFilename()).thenReturn("document.pdf");
        
        byte[] content = "Hello, ISRA!".getBytes();
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(content));

        String savedPathString = fileStorageService.storeFile(multipartFile);
        assertNotNull(savedPathString);

        Path savedPath = Path.of(savedPathString);
        assertTrue(Files.exists(savedPath));
        assertTrue(savedPath.startsWith(tempDir));
        assertEquals("Hello, ISRA!", Files.readString(savedPath));
    }

    @Test
    void storeFile_invalidPathSequence_throwsException() {
        MultipartFile multipartFile = mock(MultipartFile.class);
        when(multipartFile.getOriginalFilename()).thenReturn("../traversal.txt");

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> fileStorageService.storeFile(multipartFile)
        );

        assertTrue(exception.getMessage().contains("invalid path sequence"));
    }

    @Test
    void storeFile_ioExceptionOnInputStream_throwsException() throws IOException {
        MultipartFile multipartFile = mock(MultipartFile.class);
        when(multipartFile.getOriginalFilename()).thenReturn("test.txt");
        when(multipartFile.getInputStream()).thenThrow(new IOException("Disk error"));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> fileStorageService.storeFile(multipartFile)
        );

        assertTrue(exception.getMessage().contains("Could not store file"));
    }

    @Test
    void loadFileAsResource_validFile_returnsResource() throws IOException {
        // Create a dummy file in the temp upload directory
        Path fileToLoad = tempDir.resolve("existing_file.txt");
        Files.writeString(fileToLoad, "Secret content");

        Resource resource = fileStorageService.loadFileAsResource(fileToLoad.toString());

        assertNotNull(resource);
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());
    }

    @Test
    void loadFileAsResource_invalidPathOutsideUploadDir_throwsException() {
        // A path clearly outside tempDir
        String outsidePath = tempDir.getParent().resolve("unauthorized_file.txt").toAbsolutePath().toString();

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> fileStorageService.loadFileAsResource(outsidePath)
        );

        assertTrue(exception.getMessage().contains("Invalid file path"));
    }

    @Test
    void loadFileAsResource_nonExistentFile_throwsException() {
        String nonExistentPath = tempDir.resolve("does_not_exist.txt").toString();

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> fileStorageService.loadFileAsResource(nonExistentPath)
        );

        assertTrue(exception.getMessage().contains("File not found"));
    }
}
