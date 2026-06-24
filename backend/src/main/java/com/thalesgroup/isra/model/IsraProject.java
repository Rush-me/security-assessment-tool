package com.thalesgroup.isra.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Root aggregate for an ISRA Security Risk Assessment project. Ownership is tied to the Azure AD
 * Object ID (oid claim) — no local User entity required.
 */
@Entity
@Table(name = "isra_projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class IsraProject {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "project_name", nullable = false)
  private String projectName;

  @Column(name = "project_version")
  private String projectVersion;

  @Column(name = "project_organization")
  private String projectOrganization;

  @Column(name = "classification")
  private String classification;

  @Column(name = "schema_version")
  private Integer schemaVersion;

  @Column(name = "iteration")
  private Integer iteration;

  /**
   * Azure AD Object ID (oid JWT claim) of the user who created this project. Used for ownership
   * checks — no local user table needed.
   */
  @Column(name = "owner_oid", nullable = false, length = 100)
  private String ownerOid;

  /**
   * Display name of the owner (preferred_username from token), stored for convenience.
   */
  @Column(name = "owner_name", length = 255)
  private String ownerName;

  @OneToOne(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  private IsraProjectContext projectContext;

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<IsraTracking> trackingList = new ArrayList<>();

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<BusinessAsset> businessAssets = new ArrayList<>();

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<SupportingAsset> supportingAssets = new ArrayList<>();

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<Vulnerability> vulnerabilities = new ArrayList<>();

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<Risk> risks = new ArrayList<>();

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
