package com.thalesgroup.isra.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "isra_project_contexts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IsraProjectContext {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private IsraProject project;

    @Column(name = "project_description", columnDefinition = "LONGTEXT")
    private String projectDescription;

    @Column(name = "project_url", length = 512)
    private String projectUrl;

    @Column(name = "project_description_attachment_path", length = 512)
    private String projectDescriptionAttachmentPath;

    @Column(name = "security_project_objectives", columnDefinition = "LONGTEXT")
    private String securityProjectObjectives;

    @Column(name = "security_officer_objectives", columnDefinition = "LONGTEXT")
    private String securityOfficerObjectives;

    @Column(name = "security_assumptions", columnDefinition = "LONGTEXT")
    private String securityAssumptions;
}
